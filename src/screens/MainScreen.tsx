import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { colors, fontSizes, spacing } from '../constants/theme';
import { CalorieProgress } from '../components/CalorieProgress';
import { MacroCircle } from '../components/MacroCircle';
import { WaterTracker } from '../components/WaterTracker';
import { InfoBox } from '../components/InfoBox';
import { FoodLoggingModal } from './FoodLoggingModal';
import { calculateUserGoals } from '../utils/userGoalsCalculator';
import { handleError } from '../utils/errorHandler';
import {Dimensions} from 'react-native';

interface UserProfile {
    name: string;
    age: number;
    gender: string;
    height: number;
    weight: number;
    activityLevel: string;
    goal: string;
    targetWeight: number;
    waterGoal: number;
    streak: number;
}

interface DailyLog {
    caloriesConsumed: number;
    caloriesBurned: number;
    waterIntake: number;
    carbs: number;
    protein: number;
    fat: number;
    loggedFoods: Array<FoodItem>;
}

interface FoodItem {
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const MainScreen: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) {
            handleError(new Error('No user logged in'));
            return;
        }

        try {
            setLoading(true);
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setUserProfile(userDocSnap.data() as UserProfile);
            } else {
                handleError(new Error('User profile not found'));
            }

            const today = new Date().toISOString().split('T')[0];
            const dailyLogRef = doc(db, 'dailyLogs', `${user.uid}_${today}`);
            const dailyLogSnap = await getDoc(dailyLogRef);
            if (dailyLogSnap.exists()) {
                setDailyLog(dailyLogSnap.data() as DailyLog);
            } else {
                const newDailyLog: DailyLog = {
                    caloriesConsumed: 0,
                    caloriesBurned: 0,
                    waterIntake: 0,
                    carbs: 0,
                    protein: 0,
                    fat: 0,
                    loggedFoods: [],
                };
                await setDoc(dailyLogRef, newDailyLog);
                setDailyLog(newDailyLog);
            }
        } catch (error) {
            handleError(error as Error, 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleWaterIntakeChange = async (change: number) => {
        if (!dailyLog || !auth.currentUser) return;

        const newWaterIntake = Math.max(0, dailyLog.waterIntake + change);
        const updatedLog = { ...dailyLog, waterIntake: newWaterIntake };

        try {
            const today = new Date().toISOString().split('T')[0];
            const dailyLogRef = doc(db, 'dailyLogs', `${auth.currentUser.uid}_${today}`);
            await updateDoc(dailyLogRef, { waterIntake: newWaterIntake });
            setDailyLog(updatedLog);
        } catch (error) {
            handleError(error as Error, 'Failed to update water intake');
        }
    };

    const handleFoodLogged = useCallback(async (foodItem: FoodItem, quantity: number) => {
        if (!dailyLog || !auth.currentUser) {
            handleError(new Error('Daily log or user not found'));
            return;
        }

        const roundToOneDecimal = (num: number) => Math.round((num + Number.EPSILON) * 10) / 10;

        const updatedLog = {
            caloriesConsumed: roundToOneDecimal((dailyLog.caloriesConsumed || 0) + foodItem.calories * quantity),
            carbs: roundToOneDecimal((dailyLog.carbs || 0) + foodItem.carbs * quantity),
            protein: roundToOneDecimal((dailyLog.protein || 0) + foodItem.protein * quantity),
            fat: roundToOneDecimal((dailyLog.fat || 0) + foodItem.fat * quantity),
        };

        try {
            const today = new Date().toISOString().split('T')[0];
            const dailyLogRef = doc(db, 'dailyLogs', `${auth.currentUser.uid}_${today}`);
            await updateDoc(dailyLogRef, {
                caloriesConsumed: updatedLog.caloriesConsumed,
                carbs: updatedLog.carbs,
                protein: updatedLog.protein,
                fat: updatedLog.fat,
            });

            setDailyLog(prevLog => ({
                ...prevLog!,
                ...updatedLog,
            }));
        } catch (error) {
            handleError(error as Error, 'Failed to log food');
        }
    }, [dailyLog]);

    if (loading || !userProfile || !dailyLog) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const goals = calculateUserGoals(userProfile);
    const remainingCalories = goals.calorieGoal - (dailyLog.caloriesConsumed || 0) + (dailyLog.caloriesBurned || 0);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.calorieSection}>
                    <CalorieProgress
                        consumed={dailyLog.caloriesConsumed}
                        burned={dailyLog.caloriesBurned}
                        goal={goals.calorieGoal}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.macroContainer}>
                        <MacroCircle
                            title="Carbs"
                            current={dailyLog.carbs}
                            goal={goals.carbGoal}
                            color={colors.primary}
                            bgColor={colors.secondary}
                        />
                        <MacroCircle
                            title="Protein"
                            current={dailyLog.protein}
                            goal={goals.proteinGoal}
                            color={colors.highlight}
                            bgColor={colors.highlightAccent}
                        />
                        <MacroCircle
                            title="Fat"
                            current={dailyLog.fat}
                            goal={goals.fatGoal}
                            color={colors.warning}
                            bgColor={colors.warningAccent}
                        />
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
                            value={`${userProfile.streak || 0} Days`}
                        />
                        <InfoBox
                            icon={require('../assets/scale.png')}
                            title="Weight"
                            value={`${userProfile.weight?.toFixed(1) || '0.0'} kg`}
                        />
                    </View>

                    <TouchableOpacity style={styles.logFoodButton} onPress={() => setShowFoodModal(true)}>
                        <Text style={styles.logFoodButtonText}>Log Food</Text>
                    </TouchableOpacity>

                    <FoodLoggingModal
                        visible={showFoodModal}
                        onClose={() => setShowFoodModal(false)}
                        onFoodLogged={handleFoodLogged}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    calorieSection: {
        height: 175,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
    },
    remainingCalories: {
        color: colors.white,
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        marginTop: spacing.medium,
    },
    content: {
        padding: spacing.medium,
    },
    macroContent: {
        display: 'flex',
        flex: 1,
        position: "absolute",
        justifyContent: 'flex-start',
        alignSelf: 'center',
        padding: spacing.medium,
        top: '75%'
    },
    macroContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.small,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.large,
    },
    logFoodButton: {
        backgroundColor: colors.accent,
        padding: spacing.medium,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: spacing.large,
        width: windowWidth * 0.5,
        alignSelf: 'center'
    },
    logFoodButtonText: {
        color: colors.white,
        fontSize: fontSizes.large,
        fontWeight: 'bold',
    },
});