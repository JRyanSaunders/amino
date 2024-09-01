import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fontSizes, spacing } from '../constants/theme';

interface CardProps {
    title: string;
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ title, children, style }) => {
    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>{title}</Text>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.secondary,
        borderRadius: 10,
        padding: spacing.medium,
        marginBottom: spacing.medium,
    },
    title: {
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.small,
    },
});