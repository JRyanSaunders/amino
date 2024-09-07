import { Alert } from 'react-native';

export const handleError = (error: Error, customMessage?: string) => {
    console.error(error);

    let errorMessage = customMessage || 'An unexpected error occurred';
    if (error.message) {
        errorMessage += `: ${error.message}`;
    }

    Alert.alert('Error', errorMessage);
};