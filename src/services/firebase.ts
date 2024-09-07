import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBjMEFHh7t_l0tM6Zq2W_sa13rOl1df330",
    authDomain: "amino-live.firebaseapp.com",
    projectId: "amino-live",
    storageBucket: "amino-live.appspot.com",
    appId: "uk.co.amino"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);