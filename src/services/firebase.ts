import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBjMEFHh7t_l0tM6Zq2W_sa13rOl1df330",
    authDomain: "amino-live.firebaseapp.com",
    projectId: "amino-live",
    storageBucket: "amino-live.appspot.com",
    appId: "uk.co.amino"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);