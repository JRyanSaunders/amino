import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import { colors, fontSizes, spacing } from '../constants/theme';
import { ProgressIndicator } from '../components/ProgressIndicator';

type AuthStackParamList = {
    Account: undefined;
    PersonalInfo: { email: string; password: string };
    HealthInfo: { email: string; password: string; name: string; birthdate: string; gender: string };
};

type PersonalInfoScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PersonalInfo'>;
type PersonalInfoScreenRouteProp = RouteProp<AuthStackParamList, 'PersonalInfo'>;

type Props = {
    navigation: PersonalInfoScreenNavigationProp;
    route: PersonalInfoScreenRouteProp;
};

export const PersonalInfoScreen: React.FC<Props> = ({ navigation, route }) => {
    const [name, setName] = useState('');
    const [birthdate, setBirthdate] = useState(new Date());
    const [gender, setGender] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [errors, setErrors] = useState({ name: '', birthdate: '', gender: '' });

    const { email, password } = route.params;

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        setBirthdate(date);
        hideDatePicker();
    };

    const validate = () => {
        let isValid = true;
        let newErrors = { name: '', birthdate: '', gender: '' };

        if (!name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (birthdate > new Date()) {
            newErrors.birthdate = 'Birthdate cannot be in the future';
            isValid = false;
        }

        if (!gender) {
            newErrors.gender = 'Please select a gender';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validate()) {
            navigation.navigate('HealthInfo', {
                email,
                password,
                name,
                birthdate: birthdate.toISOString(),
                gender
            });
        } else {
            Alert.alert('Error', 'Please fill all fields correctly');
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <ProgressIndicator totalSteps={4} currentStep={1} />
            <Text style={styles.title}>Personal Information</Text>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                <Text>{birthdate.toDateString()}</Text>
            </TouchableOpacity>
            {errors.birthdate ? <Text style={styles.errorText}>{errors.birthdate}</Text> : null}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
            <Picker
                selectedValue={gender}
                style={styles.picker}
                onValueChange={(itemValue) => setGender(itemValue)}
            >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
            </Picker>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
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