import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface MacroCircleProps {
    title: string;
    current: number;
    goal: number;
    color: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({ title, current, goal, color }) => {
    const progress = (current / goal) * 100;

    return (
        <View style={styles.container}>
            <AnimatedCircularProgress
                size={100}
                width={10}
                fill={progress}
                tintColor={color}
                backgroundColor="#e0e0e0"
            >
                {() => (
                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.value}>{current} / {goal}g</Text>
                    </View>
                )}
            </AnimatedCircularProgress>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 14,
    },
});