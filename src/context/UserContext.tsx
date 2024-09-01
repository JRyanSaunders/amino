import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface UserProfile {
    name: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: number;
}

interface UserContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    updateUserProfile: (data: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                setUserProfile(userDoc.data() as UserProfile);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateUserProfile = (data: Partial<UserProfile>) => {
        setUserProfile(prev => prev ? { ...prev, ...data } : null);
    };

    return (
        <UserContext.Provider value={{ user, userProfile, loading, updateUserProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};