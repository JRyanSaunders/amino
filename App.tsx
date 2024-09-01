import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import { queryClient } from './src/services/reactQuery';
import { UserProvider } from './src/context/UserContext';

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <UserProvider>
                    <AppNavigator />
                </UserProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}