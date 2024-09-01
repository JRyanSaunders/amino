import { Alert } from 'react-native';

export const handleError = (error: any, customMessage?: string) => {
    console.error(error);

    let errorMessage = customMessage || 'An unexpected error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }

    Alert.alert('Error', errorMessage);
};