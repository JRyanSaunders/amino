import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { colors, fontSizes, spacing } from '../constants/theme';
import { useUser } from '../context/UserContext';
import { auth, db } from '../services/firebase';

export const SettingsScreen: React.FC = () => {
    const { user, userProfile, updateUserProfile } = useUser();
    const navigation = useNavigation();

    const [name, setName] = useState(user?.displayName || '');
    const [age, setAge] = useState(userProfile?.age?.toString() || '');
    const [height, setHeight] = useState(userProfile?.height?.toString() || '');
    const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
    const [activityLevel, setActivityLevel] = useState(userProfile?.activityLevel?.toString() || '');

    const handleUpdateProfile = async () => {
        if (!user) return;

        try {
            await updateProfile(user, { displayName: name });
            await updateDoc(doc(db, 'users', user.uid), {
                name,
                age: parseInt(age),
                height: parseInt(height),
                weight: parseInt(weight),
                activityLevel: parseInt(activityLevel),
            });
            updateUserProfile({
                name,
                age: parseInt(age),
                height: parseInt(height),
                weight: parseInt(weight),
                activityLevel: parseInt(activityLevel),
            });
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Height (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Activity Level (1-5)"
                value={activityLevel}
                onChangeText={setActivityLevel}
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
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
    input: {
        backgroundColor: colors.secondary,
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
        marginTop: spacing.medium,
    },
    buttonText: {
        color: colors.background,
        fontSize: fontSizes.medium,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: colors.error,
        marginTop: spacing.xlarge,
    },
});