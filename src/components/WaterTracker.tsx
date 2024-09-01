import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../constants/theme';

interface WaterTrackerProps {
    current: number;
    goal: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ current, goal, onIncrease, onDecrease }) => {
    const progress = (current / goal) * 100;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Water Intake</Text>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{current.toFixed(1)}L / {goal.toFixed(1)}L</Text>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.button} onPress={onDecrease}>
                    <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onIncrease}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.large,
    },
    title: {
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.small,
    },
    progressContainer: {
        height: 10, // Thinner progress bar
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.small,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    progressText: {
        fontSize: fontSizes.medium,
        color: colors.text,
        marginTop: spacing.small,
        textAlign: 'center',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.medium,
    },
    button: {
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: spacing.small,
    },
    buttonText: {
        color: colors.white,
        fontSize: fontSizes.large,
        fontWeight: 'bold',
    },
});