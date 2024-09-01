import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GoalsScreen } from '../screens/GoalsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';
import { FoodLoggingModal } from '../screens/FoodLoggingModal';
import { calculateUserGoals } from '../utils/userGoalsCalculator';
import { CalorieProgress } from '../components/CalorieProgress';
import { MacroCircle } from '../components/MacroCircle';
import { WaterTracker } from '../components/WaterTracker';
import { InfoBox } from '../components/InfoBox';
import { colors, fontSizes, spacing } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface DailyLog {
    caloriesConsumed: number;
    caloriesBurned: number;
    waterIntake: number;
    carbs: number;
    protein: number;
    fat: number;
}

export const MainScreen: React.FC = () => {
    const [showFoodModal, setShowFoodModal] = useState(false);
    const { user, userProfile } = useUser();
    const [dailyLog, setDailyLog] = useState<DailyLog>({
        caloriesConsumed: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
    });
    const [goals, setGoals] = useState({
        calorieGoal: 2000,
        proteinGoal: 150,
        fatGoal: 65,
        carbGoal: 250,
        waterGoal: 2.5,
    });

    const fetchDailyLog = useCallback(async () => {
        if (!user) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const dailyLogRef = doc(db, 'dailyLogs', `${user.uid}_${today}`);
            const dailyLogSnap = await getDoc(dailyLogRef);
            if (dailyLogSnap.exists()) {
                setDailyLog(dailyLogSnap.data() as DailyLog);
            }
        } catch (err) {
            console.error('Failed to fetch daily log:', err);
        }
    }, [user]);

    useEffect(() => {
        fetchDailyLog();
        if (userProfile) {
            setGoals(calculateUserGoals(userProfile));
        }
    }, [fetchDailyLog, userProfile]);

    const handleWaterIntakeChange = async (change: number) => {
        if (!user) return;
        const updatedWaterIntake = Math.max(0, dailyLog.waterIntake + change);
        const updatedLog = { ...dailyLog, waterIntake: updatedWaterIntake };
        setDailyLog(updatedLog);
        const today = new Date().toISOString().split('T')[0];
        const dailyLogRef = doc(db, 'dailyLogs', `${user.uid}_${today}`);
        try {
            await setDoc(dailyLogRef, updatedLog, { merge: true });
        } catch (err) {
            console.error('Failed to update water intake:', err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.topSection}>
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.gradientBackground}
                    >
                        <CalorieProgress
                            consumed={dailyLog.caloriesConsumed}
                            burned={dailyLog.caloriesBurned}
                            goal={goals.calorieGoal}
                        />
                    </LinearGradient>
                </View>

                <View style={styles.content}>
                    <View style={styles.macroContainer}>
                        <MacroCircle title="Carbs" current={dailyLog.carbs} goal={goals.carbGoal} color={colors.accent} />
                        <MacroCircle title="Protein" current={dailyLog.protein} goal={goals.proteinGoal} color={colors.highlight} />
                        <MacroCircle title="Fat" current={dailyLog.fat} goal={goals.fatGoal} color={colors.warning} />
                    </View>

                    <WaterTracker
                        current={dailyLog.waterIntake}
                        goal={goals.waterGoal}
                        onIncrease={() => handleWaterIntakeChange(0.1)}
                        onDecrease={() => handleWaterIntakeChange(-0.1)}
                    />

                    <View style={styles.bottomRow}>
                        <InfoBox
                            icon={require('../assets/fire.png')}
                            title="Streak"
                            value="10 Days"
                        />
                        <InfoBox
                            icon={require('../assets/scale.png')}
                            title="Weight"
                            value={`${userProfile?.weight || 0}kg`}
                        />
                    </View>

                    <TouchableOpacity style={styles.logFoodButton} onPress={() => setShowFoodModal(true)}>
                        <Text style={styles.logFoodButtonText}>Log Food</Text>
                    </TouchableOpacity>

                    <FoodLoggingModal
                        visible={showFoodModal}
                        onClose={() => setShowFoodModal(false)}
                        onFoodLogged={fetchDailyLog}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    topSection: {
        height: height * 0.4,
        overflow: 'visible',
    },
    gradientBackground: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    content: {
        padding: spacing.medium,
        marginTop: -height * 0.05,
    },
    macroContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.large,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.large,
    },
    logFoodButton: {
        backgroundColor: colors.primary,
        padding: spacing.medium,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: spacing.large,
    },
    logFoodButtonText: {
        color: colors.white,
        fontSize: fontSizes.large,
        fontWeight: 'bold',
    },
});

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const RootStack = createStackNavigator();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
);

const MainNavigator = () => (
    <MainTab.Navigator>
        <MainTab.Screen name="Home" component={MainScreen} />
        <MainTab.Screen name="Goals" component={GoalsScreen} />
        <MainTab.Screen name="Settings" component={SettingsScreen} />
    </MainTab.Navigator>
);

export const AppNavigator: React.FC = () => {
    const { user, loading } = useUser();

    if (loading) {
        // You might want to show a loading screen here
        return null;
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <RootStack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};