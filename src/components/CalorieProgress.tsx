import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import {colors} from "../constants/theme";

interface CalorieProgressProps {
    consumed: number;
    burned: number;
    goal: number;
}

export const CalorieProgress: React.FC<CalorieProgressProps> = ({ consumed, burned, goal }) => {
    const remaining = goal - consumed + burned;
    const progress = ((consumed - burned) / goal) * 100;

    return (
        <View style={styles.container}>
            <AnimatedCircularProgress
                size={200}
                width={20}
                fill={progress}
                tintColor="#8bc34a"
                backgroundColor="#e0e0e0"
                arcSweepAngle={180}
                rotation={-90}
                lineCap="round"
            >
                {() => (
                    <View style={styles.content}>
                        <Text style={styles.remainingValue}>{remaining}</Text>
                        <Text style={styles.remainingLabel}>cal Remaining</Text>
                    </View>
                )}
            </AnimatedCircularProgress>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 65,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    remainingValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.white,
    },
    remainingLabel: {
        fontSize: 16,
        color: colors.white,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        // marginTop: 10,
    },
    detailText: {
        fontSize: 16,
        color: '#4CAF50',
    },
});