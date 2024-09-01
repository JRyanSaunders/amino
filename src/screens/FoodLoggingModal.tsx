import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { doc, setDoc, increment } from 'firebase/firestore';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';
import { colors, fontSizes, spacing, borderRadius } from '../constants/theme';

interface FoodLoggingModalProps {
    visible: boolean;
    onClose: () => void;
    onFoodLogged: () => void;
}

interface FoodItem {
    food_id: string;
    food_name: string;
    brand_name?: string;
    food_type: string;
    calories: number;
    protein: number;
    carbohydrate: number;
    fat: number;
}

const API_URL = 'https://platform.fatsecret.com/rest/server.api';
const CONSUMER_KEY = '7b8f33a7d1354364b7a8a861ca70cfa4';
const CONSUMER_SECRET = 'a09829df4a8446f18e781cfac2281b1b';

const generateOauthParameters = (method: string, url: string, params: Record<string, string>) => {
    const oauthParams = {
        oauth_consumer_key: CONSUMER_KEY,
        oauth_nonce: Math.random().toString(36).substring(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0',
    };

    const allParams = { ...params, ...oauthParams };
    const sortedParams = Object.keys(allParams).sort().reduce((acc, key) => {
        acc[key] = allParams[key];
        return acc;
    }, {} as Record<string, string>);

    const paramString = Object.entries(sortedParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(CONSUMER_SECRET)}&`;
    const signature = CryptoJS.HmacSHA1(signatureBaseString, signingKey).toString(CryptoJS.enc.Base64);

    return {
        ...oauthParams,
        oauth_signature: signature,
    };
};

const parseNutritionInfo = (description: string): { calories: number; protein: number; carbohydrate: number; fat: number } => {
    const nutritionRegex = /Calories: (\d+)kcal \| Fat: ([\d.]+)g \| Carbs: ([\d.]+)g \| Protein: ([\d.]+)g/;
    const match = description.match(nutritionRegex);

    if (match) {
        return {
            calories: parseInt(match[1], 10),
            fat: parseFloat(match[2]),
            carbohydrate: parseFloat(match[3]),
            protein: parseFloat(match[4]),
        };
    }

    return { calories: 0, protein: 0, carbohydrate: 0, fat: 0 };
};

export const FoodLoggingModal: React.FC<FoodLoggingModalProps> = ({ visible, onClose, onFoodLogged }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();

    const searchFood = async (query: string) => {
        setIsLoading(true);
        try {
            const params = {
                method: 'foods.search',
                search_expression: query,
                format: 'json',
                max_results: '50',
            };

            const oauthParams = generateOauthParameters('GET', API_URL, params);
            const allParams = { ...params, ...oauthParams };

            const response = await axios.get(API_URL, {
                params: allParams,
            });

            if (response.data && response.data.foods && response.data.foods.food) {
                const foods = response.data.foods.food;
                const parsedFoods: FoodItem[] = foods.map((food: any) => {
                    const nutritionInfo = parseNutritionInfo(food.food_description);
                    return {
                        food_id: food.food_id,
                        food_name: food.food_name,
                        brand_name: food.brand_name,
                        food_type: food.food_type,
                        ...nutritionInfo,
                    };
                });
                setSearchResults(parsedFoods);
            } else {
                setSearchResults([]);
                console.log('No foods found or unexpected response structure');
            }
        } catch (error) {
            console.error('Error searching food:', error);
            Alert.alert('Error', 'Failed to search for food. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchTerm.length > 2) {
            searchFood(searchTerm);
        } else {
            Alert.alert('Invalid Search', 'Please enter at least 3 characters to search.');
        }
    };

    const handleLogFood = async () => {
        if (!selectedFood || !user) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const dailyLogRef = doc(db, 'dailyLogs', `${user.uid}_${today}`);
            const quantityNum = parseFloat(quantity) || 0;

            await setDoc(dailyLogRef, {
                caloriesConsumed: increment(selectedFood.calories * quantityNum),
                carbs: increment(selectedFood.carbohydrate * quantityNum),
                protein: increment(selectedFood.protein * quantityNum),
                fat: increment(selectedFood.fat * quantityNum),
            }, { merge: true });

            onFoodLogged();
            onClose();
        } catch (error) {
            console.error('Error logging food:', error);
            Alert.alert('Error', 'Failed to log food. Please try again.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Log Food</Text>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Search for food"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            placeholderTextColor={colors.text}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.food_id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.foodItem}
                                    onPress={() => setSelectedFood(item)}
                                >
                                    <Text style={styles.foodItemText}>{item.food_name}</Text>
                                    <Text style={styles.foodItemCalories}>{item.calories} cal</Text>
                                </TouchableOpacity>
                            )}
                            style={styles.foodList}
                        />
                    )}
                    {selectedFood && (
                        <View style={styles.selectedFood}>
                            <Text style={styles.selectedFoodText}>{selectedFood.food_name}</Text>
                            <View style={styles.nutritionInfo}>
                                <Text style={styles.nutritionText}>Calories: {selectedFood.calories}</Text>
                                <Text style={styles.nutritionText}>Protein: {selectedFood.protein}g</Text>
                                <Text style={styles.nutritionText}>Carbs: {selectedFood.carbohydrate}g</Text>
                                <Text style={styles.nutritionText}>Fat: {selectedFood.fat}g</Text>
                            </View>
                            <TextInput
                                style={styles.quantityInput}
                                placeholder="Quantity"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                placeholderTextColor={colors.text}
                            />
                            <TouchableOpacity style={styles.logButton} onPress={handleLogFood}>
                                <Text style={styles.logButtonText}>Log Food</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.large,
        padding: spacing.large,
        width: '90%',
        maxHeight: '80%',
    },
    title: {
        fontSize: fontSizes.xlarge,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.medium,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: spacing.medium,
    },
    input: {
        flex: 1,
        backgroundColor: colors.white,
        borderColor: colors.neutral,
        borderWidth: 1,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        fontSize: fontSizes.medium,
        color: colors.text,
    },
    searchButton: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.medium,
        borderRadius: borderRadius.medium,
        marginLeft: spacing.small,
    },
    searchButtonText: {
        color: colors.white,
        fontSize: fontSizes.medium,
        fontWeight: 'bold',
    },
    foodList: {
        maxHeight: 200,
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral,
    },
    foodItemText: {
        fontSize: fontSizes.medium,
        color: colors.text,
    },
    foodItemCalories: {
        fontSize: fontSizes.medium,
        color: colors.primary,
    },
    selectedFood: {
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        marginTop: spacing.medium,
    },
    selectedFoodText: {
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.small,
    },
    nutritionInfo: {
        marginBottom: spacing.small,
    },
    nutritionText: {
        fontSize: fontSizes.medium,
        color: colors.text,
    },
    quantityInput: {
        backgroundColor: colors.white,
        borderColor: colors.neutral,
        borderWidth: 1,
        borderRadius: borderRadius.medium,
        padding: spacing.small,
        marginBottom: spacing.small,
        fontSize: fontSizes.medium,
        color: colors.text,
    },
    logButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.medium,
        padding: spacing.medium,
        alignItems: 'center',
        width: '50%',  // Make the button half the width
        alignSelf: 'center',  // Center the button
    },
    logButtonText: {
        color: colors.white,
        fontSize: fontSizes.medium,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: spacing.medium,
        padding: spacing.small,
        alignItems: 'center',
    },
    closeButtonText: {
        color: colors.primary,
        fontSize: fontSizes.medium,
        fontWeight: 'bold',
    },
});