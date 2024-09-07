import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import {colors} from "../constants/theme";

interface MacroCircleProps {
    title: string;
    current: number;
    goal: number;
    color: string;
    bgColor: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({ title, current, goal, color, bgColor }) => {
    const progress = (current / goal) * 100;

    return (
        <View style={styles.container}>
            <AnimatedCircularProgress
                size={105}
                width={10}
                fill={progress}
                tintColor={color}
                backgroundColor={bgColor}
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
        letterSpacing: 1,
    },
    value: {
        color: colors.text,
        fontSize: 12,
    },
});