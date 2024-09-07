import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useUser } from '../context/UserContext';

import { LoginScreen } from '../screens/LoginScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { HealthInfoScreen } from '../screens/HealthInfoScreen';
import { GoalSettingScreen } from '../screens/GoalSettingScreen';
import { MainScreen } from '../screens/MainScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

import { colors } from '../constants/theme';
import {AccountDetails} from "../screens/AccountDetails";

const AuthStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const RootStack = createStackNavigator();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Account" component={AccountScreen} />
        <AuthStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <AuthStack.Screen name="HealthInfo" component={HealthInfoScreen} />
        <AuthStack.Screen name="GoalSetting" component={GoalSettingScreen} />
    </AuthStack.Navigator>
);

const SettingsNavigator = () => (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
        <SettingsStack.Screen name="Settings" component={SettingsScreen} />
        <SettingsStack.Screen name="AccountDetails" component={AccountDetails} />
    </SettingsStack.Navigator>
);

const MainNavigator = () => (
    <MainTab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Goals') {
                    iconName = focused ? 'trophy' : 'trophy-outline';
                } else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.text,
        })}
    >
        <MainTab.Screen name="Home" component={MainScreen} options={{headerShown: false}}/>
        <MainTab.Screen name="Goals" component={GoalsScreen} />
        <MainTab.Screen name="Settings" component={SettingsNavigator} />
    </MainTab.Navigator>
);

export const AppNavigator: React.FC = () => {
    const { user, loading } = useUser();

    if (loading) {   // You might want to show a loading screen here
        return null;
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <RootStack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};