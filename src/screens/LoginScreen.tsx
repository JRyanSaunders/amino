import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigation.navigate('Main');
        } catch (error) {
            Alert.alert('Login Failed', 'Please check your email and password.');
        }
    };

    const handleCreateAccount = () => {
        navigation.navigate('Account');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Amino</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateAccount}>
                <Text style={styles.createAccountText}>Create an account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#eefaef',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#159173',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#d8d8d8',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#159173',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    createAccountText: {
        marginTop: 20,
        color: '#277751',
        textDecorationLine: 'underline',
    },
});