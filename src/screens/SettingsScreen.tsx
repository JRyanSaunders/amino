import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut, updateProfile } from 'firebase/auth';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import { colors, fontSizes, spacing } from '../constants/theme';
import { useUser } from '../context/UserContext';
import { auth, db } from '../services/firebase';
import {Ionicons} from "@expo/vector-icons";

export const SettingsScreen: React.FC = () => {
    const { user, userProfile, updateUserProfile } = useUser();
    const navigation = useNavigation();

    const [name, setName] = useState(user?.displayName || '');
    const [age, setAge] = useState(userProfile?.age?.toString() || '');
    const [height, setHeight] = useState(userProfile?.height?.toString() || '');
    const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
    const [activityLevel, setActivityLevel] = useState(userProfile?.activityLevel?.toString() || '');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                const userData = userDoc.data();
                if (userData) {
                    setName(userData.name || '');
                    setWeight(userData.weight?.toString() || '');
                    setHeight(userData.height?.toString() || '');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

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

    const navigateToAccountDetails = () => {
        navigation.navigate('AccountDetails')
    }

    return (
        <View style={styles.container}>
            <View>
            <Text style={styles.title}>Settings</Text>

            <TouchableOpacity style={styles.setting} onPress={navigateToAccountDetails}>
                <Text>Account Details</Text>
                <Ionicons name={'chevron-forward-outline'} size={20} color={'red'} />
            </TouchableOpacity>
            </View>

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
        justifyContent: "space-between"
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
    setting: {
        backgroundColor: colors.secondary,
        borderRadius: 5,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        fontSize: fontSizes.medium,
        justifyContent: 'space-between',
        flexDirection: 'row'
    }
});