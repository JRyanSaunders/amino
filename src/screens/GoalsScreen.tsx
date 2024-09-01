import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { colors, fontSizes, spacing } from '../constants/theme';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';

export const GoalsScreen: React.FC = () => {
    const { user } = useUser();
    const [weightData, setWeightData] = useState<number[]>([]);
    const [proteinData, setProteinData] = useState<number[]>([]);
    const [waterData, setWaterData] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const dailyLogsRef = collection(db, 'dailyLogs');
            const q = query(
                dailyLogsRef,
                where('userId', '==', user.uid),
                orderBy('date', 'desc'),
                limit(7)
            );

            const querySnapshot = await getDocs(q);
            const weights: number[] = [];
            const proteins: number[] = [];
            const waters: number[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                weights.unshift(data.weight || 0);
                proteins.unshift(data.proteinConsumed || 0);
                waters.unshift(data.waterGlasses || 0);
            });

            setWeightData(weights);
            setProteinData(proteins);
            setWaterData(waters);
        };

        fetchData();
    }, [user]);

    const chartConfig = {
        backgroundColor: colors.background,
        backgroundGradientFrom: colors.background,
        backgroundGradientTo: colors.background,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Your Progress</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Weight Progress</Text>
                {weightData.length > 0 && (
                    <LineChart
                        data={{
                            labels: ["7d", "6d", "5d", "4d", "3d", "2d", "1d"],
                            datasets: [{ data: weightData }]
                        }}
                        width={300}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Protein Intake</Text>
                {proteinData.length > 0 && (
                    <LineChart
                        data={{
                            labels: ["7d", "6d", "5d", "4d", "3d", "2d", "1d"],
                            datasets: [{ data: proteinData }]
                        }}
                        width={300}
                        height={200}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
                        }}
                        bezier
                        style={styles.chart}
                    />
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Water Intake</Text>
                {waterData.length > 0 && (
                    <LineChart
                        data={{
                            labels: ["7d", "6d", "5d", "4d", "3d", "2d", "1d"],
                            datasets: [{ data: waterData }]
                        }}
                        width={300}
                        height={200}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                        }}
                        bezier
                        style={styles.chart}
                    />
                )}
            </View>
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
    card: {
        backgroundColor: colors.secondary,
        borderRadius: 10,
        padding: spacing.medium,
        marginBottom: spacing.large,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.medium,
    },
    chart: {
        marginVertical: spacing.medium,
        borderRadius: 16,
    },
});