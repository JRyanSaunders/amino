import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { colors, fontSizes, spacing } from '../constants/theme';
import { ProgressIndicator } from '../components/ProgressIndicator';

type AuthStackParamList = {
    GoalSetting: {
        email: string;
        password: string;
        name: string;
        birthdate: string;
        gender: string;
        height: string;
        weight: string;
        activityLevel: string;
    };
};

type GoalSettingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'GoalSetting'>;
type GoalSettingScreenRouteProp = RouteProp<AuthStackParamList, 'GoalSetting'>;

type Props = {
    navigation: GoalSettingScreenNavigationProp;
    route: GoalSettingScreenRouteProp;
};

export const GoalSettingScreen: React.FC<Props> = ({ navigation, route }) => {
    const [goal, setGoal] = useState('');
    const [targetWeight, setTargetWeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { email, password, name, birthdate, gender, height, weight, activityLevel } = route.params;

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        if (!goal || !targetWeight) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Calculate age from birthdate
            const birthDate = new Date(birthdate);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);

            // Prepare user data for Firestore
            const userDataForFirestore = {
                name,
                age,
                gender,
                height: parseFloat(height),
                weight: parseFloat(weight),
                activityLevel,
                goal,
                targetWeight: parseFloat(targetWeight),
                createdAt: new Date(),
            };

            await setDoc(doc(db, 'users', user.uid), userDataForFirestore);

            // Navigate to the main app
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (error) {
            console.error('Error during sign up:', error);
            setError('Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ProgressIndicator totalSteps={4} currentStep={3} />
            <Text style={styles.title}>Set Your Goals</Text>
            <Picker
                selectedValue={goal}
                style={styles.picker}
                onValueChange={(itemValue) => setGoal(itemValue)}
            >
                <Picker.Item label="Select your goal" value="" />
                <Picker.Item label="Lose Weight" value="lose" />
                <Picker.Item label="Maintain Weight" value="maintain" />
                <Picker.Item label="Gain Weight" value="gain" />
            </Picker>
            <TextInput
                style={styles.input}
                placeholder="Target Weight (kg)"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: fontSizes.xlarge,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.large,
        textAlign: 'center',
    },
    picker: {
        backgroundColor: colors.white,
        borderColor: colors.neutral,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: spacing.medium,
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