import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { colors, fontSizes, spacing } from '../constants/theme';

export const GoalsScreen: React.FC = () => {
    const [weightData, setWeightData] = useState<number[]>([]);
    const [calorieData, setCalorieData] = useState<number[]>([]);
    const [dates, setDates] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;

            const dailyLogsRef = collection(db, 'dailyLogs');
            const q = query(
                dailyLogsRef,
                where('userId', '==', auth.currentUser.uid),
                orderBy('date', 'desc'),
                limit(7)
            );

            try {
                const querySnapshot = await getDocs(q);
                const weights: number[] = [];
                const calories: number[] = [];
                const fetchedDates: string[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    weights.push(data.weight || 0);
                    calories.push(data.caloriesConsumed || 0);
                    fetchedDates.push(data.date);
                });

                setWeightData(weights.reverse());
                setCalorieData(calories.reverse());
                setDates(fetchedDates.reverse());
            } catch (error) {
                console.error('Error fetching goal data:', error);
            }
        };

        fetchData();
    }, []);

    const chartConfig = {
        backgroundGradientFrom: colors.background,
        backgroundGradientTo: colors.background,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Your Progress</Text>

            <Text style={styles.chartTitle}>Weight Progress</Text>
            <LineChart
                data={{
                    labels: dates,
                    datasets: [{ data: weightData }],
                }}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />

            <Text style={styles.chartTitle}>Calorie Intake</Text>
            <LineChart
                data={{
                    labels: dates,
                    datasets: [{ data: calorieData }],
                }}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`}}
                bezier
                style={styles.chart}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.medium,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: fontSizes.xlarge,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.large,
    },
    chartTitle: {
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.large,
        marginBottom: spacing.medium,
    },
    chart: {
        marginVertical: spacing.medium,
        borderRadius: 16,
    },
});