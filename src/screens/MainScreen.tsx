import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions,
    Alert,
} from 'react-native';
import { doc, getDoc, setDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';
import { FoodLoggingModal } from './FoodLoggingModal';
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
    loggedFoods: Array<{id: string; name: string; calories: number; carbs: number; protein: number; fat: number}>;
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
    loggedFoods: [],
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
        } else {
            // Initialize the daily log if it doesn't exist
            const initialLog: DailyLog = {
                caloriesConsumed: 0,
                caloriesBurned: 0,
                waterIntake: 0,
                carbs: 0,
                protein: 0,
                fat: 0,
                loggedFoods: [],
            };
            await setDoc(dailyLogRef, initialLog);
            setDailyLog(initialLog);
        }
    } catch (err) {
        console.error('Failed to fetch daily log:', err);
        Alert.alert('Error', 'Failed to load your daily log. Please try again.');
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
        await updateDoc(dailyLogRef, { waterIntake: updatedWaterIntake });
    } catch (err) {
        console.error('Failed to update water intake:', err);
        Alert.alert('Error', 'Failed to update water intake. Please try again.');
    }
};

const handleRemoveFood = async (foodItem: { id: string; name: string; calories: number; carbs: number; protein: number; fat: number }) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const dailyLogRef = doc(db, 'dailyLogs', `${user.uid}_${today}`);
    try {
        const updatedLog = {
            ...dailyLog,
            caloriesConsumed: dailyLog.caloriesConsumed - foodItem.calories,
            carbs: dailyLog.carbs - foodItem.carbs,
            protein: dailyLog.protein - foodItem.protein,
            fat: dailyLog.fat - foodItem.fat,
            loggedFoods: dailyLog.loggedFoods.filter(food => food.id !== foodItem.id),
        };
        await updateDoc(dailyLogRef, updatedLog);
        setDailyLog(updatedLog);
    } catch (err) {
        console.error('Failed to remove food:', err);
        Alert.alert('Error', 'Failed to remove food. Please try again.');
    }
};

const remainingCalories = goals.calorieGoal - dailyLog.caloriesConsumed + dailyLog.caloriesBurned;

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

                {dailyLog.loggedFoods.length > 0 && (
                    <View style={styles.loggedFoodsContainer}>
                        <Text style={styles.loggedFoodsTitle}>Logged Foods</Text>
                        {dailyLog.loggedFoods.map((food) => (
                            <View key={food.id} style={styles.loggedFoodItem}>
                                <Text>{food.name} - {food.calories} cal</Text>
                                <TouchableOpacity onPress={() => handleRemoveFood(food)}>
                                    <Text style={styles.removeFood}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

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
        height: height * 0.3,
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
        width: '50%',
        alignSelf: 'center',
    },
    logFoodButtonText: {
        color: colors.white,
        fontSize: fontSizes.large,
        fontWeight: 'bold',
    },
    loggedFoodsContainer: {
        marginTop: spacing.large,
    },
    loggedFoodsTitle: {
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        marginBottom: spacing.medium,
    },
    loggedFoodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.small,
    },
    removeFood: {
        color: colors.error,
        fontSize: fontSizes.small,
    },
});