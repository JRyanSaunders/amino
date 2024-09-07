import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { colors, fontSizes, spacing } from '../constants/theme';
import { ProgressIndicator } from '../components/ProgressIndicator';

type AuthStackParamList = {
    PersonalInfo: { email: string; password: string; name: string; birthdate: string; gender: string };
    HealthInfo: { email: string; password: string; name: string; birthdate: string; gender: string };
    GoalSetting: { email: string; password: string; name: string; birthdate: string; gender: string; height: string; weight: string; activityLevel: string };
};

type HealthInfoScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'HealthInfo'>;
type HealthInfoScreenRouteProp = RouteProp<AuthStackParamList, 'HealthInfo'>;

type Props = {
    navigation: HealthInfoScreenNavigationProp;
    route: HealthInfoScreenRouteProp;
};

export const HealthInfoScreen: React.FC<Props> = ({ navigation, route }) => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('');
    const [errors, setErrors] = useState({ height: '', weight: '', activityLevel: '' });
    const [isLoading, setIsLoading] = useState(false);

    const { email, password, name, birthdate, gender } = route.params;

    const validate = () => {
        let isValid = true;
        let newErrors = { height: '', weight: '', activityLevel: '' };

        if (!height || isNaN(Number(height)) || Number(height) <= 0) {
            newErrors.height = 'Please enter a valid height';
            isValid = false;
        }

        if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
            newErrors.weight = 'Please enter a valid weight';
            isValid = false;
        }

        if (!activityLevel) {
            newErrors.activityLevel = 'Please select an activity level';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validate()) {
            setIsLoading(true);
            // Simulate an API call or some async operation
            setTimeout(() => {
                setIsLoading(false);
                navigation.navigate('GoalSetting', {
                    email, password, name, birthdate, gender, height, weight, activityLevel
                });
            }, 1000);
        } else {
            Alert.alert('Error', 'Please fill all fields correctly');
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <ProgressIndicator totalSteps={4} currentStep={2} />
            <Text style={styles.title}>Health Information</Text>
            <TextInput
                style={styles.input}
                placeholder="Height (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
            />
            {errors.height ? <Text style={styles.errorText}>{errors.height}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
            />
            {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}
            <Text style={styles.label}>Activity Level</Text>
            <Picker
                selectedValue={activityLevel}
                style={styles.picker}
                onValueChange={(itemValue) => setActivityLevel(itemValue)}
            >
                <Picker.Item label="Select Activity Level" value="" />
                <Picker.Item label="Sedentary (little or no exercise)" value="sedentary" />
                <Picker.Item label="Lightly active (light exercise 1-3 days/week)" value="light" />
                <Picker.Item label="Moderately active (moderate exercise 3-5 days/week)" value="moderate" />
                <Picker.Item label="Very active (hard exercise 6-7 days/week)" value="very" />
                <Picker.Item label="Super active (very hard exercise & physical job)" value="super" />
            </Picker>
            {errors.activityLevel ? <Text style={styles.errorText}>{errors.activityLevel}</Text> : null}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                )}
            </View>
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
    input: {
        backgroundColor: colors.white,
        borderColor: colors.neutral,
        borderWidth: 1,
        borderRadius: 5,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        fontSize: fontSizes.medium,
    },
    label: {
        fontSize: fontSizes.medium,
        color: colors.text,
        marginBottom: spacing.small,
    },
    picker: {
        backgroundColor: colors.white,
        borderColor: colors.neutral,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: spacing.medium,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.large,
    },
    backButton: {
        backgroundColor: colors.neutral,
        padding: spacing.medium,
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.small,
    },
    nextButton: {
        backgroundColor: colors.primary,
        padding: spacing.medium,
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
        marginLeft: spacing.small,
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