import axios from 'axios';
import { encode as base64Encode } from 'base-64';

const API_URL = 'https://platform.fatsecret.com/rest/server.api';
const CLIENT_ID = '7b8f33a7d1354364b7a8a861ca70cfa4';
const CLIENT_SECRET = 'a09829df4a8446f18e781cfac2281b1b';

export const getAccessToken = async () => {
    try {
        const response = await axios.post('https://oauth.fatsecret.com/connect/token',
            'grant_type=client_credentials&scope=basic',
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
};

export const searchFood = async (query: string) => {
    try {
        const token = await getAccessToken();
        const response = await axios.get(API_URL, {
            params: {
                method: 'foods.search',
                search_expression: query,
                format: 'json'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.foods.food;
    } catch (error) {
        console.error('Error searching food:', error);
        throw error;
    }
};