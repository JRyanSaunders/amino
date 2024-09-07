import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface ProgressIndicatorProps {
    totalSteps: number;
    currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ totalSteps, currentStep }) => {
    return (
        <View style={styles.container}>
            {[...Array(totalSteps)].map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.step,
                        index < currentStep ? styles.completedStep : null,
                        index === currentStep ? styles.currentStep : null,
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    step: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.neutral,
    },
    completedStep: {
        backgroundColor: colors.primary,
    },
    currentStep: {
        backgroundColor: colors.accent,
        transform: [{ scale: 1.2 }],
    },
});