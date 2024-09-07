import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, fontSizes, spacing } from '../constants/theme';

type AuthStackParamList = {
    Account: undefined;
    PersonalInfo: { email: string; password: string };
};

type AccountScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Account'>;

type Props = {
    navigation: AccountScreenNavigationProp;
};

export const AccountScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });

    const validateInputs = () => {
        let isValid = true;
        const newErrors = { email: '', password: '' };

        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateInputs()) {
            navigation.navigate('PersonalInfo', { email, password });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Your Account</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.large,
    },
    title: {
        fontSize: fontSizes.xlarge,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.large,
        textAlign: 'center',
    },
    input: {
        backgroundColor: colors.white,
        borderColor: colors.neutral,
        borderWidth: 1,
        borderRadius: 5,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        fontSize: fontSizes.medium,
    },
    button: {
        backgroundColor: colors.primary,
        padding: spacing.medium,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: spacing.large,
    },
    buttonText: {
        color: colors.white,
        fontSize: fontSizes.large,
        fontWeight: 'bold',
    },
    errorText: {
        color: colors.error,
        fontSize: fontSizes.small,
        marginBottom: spacing.small,
    },
});