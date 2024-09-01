import axios from 'axios';

const CLIENT_ID = '7b8f33a7d1354364b7a8a861ca70cfa4';
const CLIENT_SECRET = 'a09829df4a8446f18e781cfac2281b1b';
const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

const getAccessToken = async () => {
    if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
        return accessToken;
    }

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

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
};

export const searchFood = async (query: string) => {
    const token = await getAccessToken();
    const response = await axios.get(BASE_URL, {
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
};

export const getFoodDetails = async (foodId: string) => {
    const token = await getAccessToken();
    const response = await axios.get(BASE_URL, {
        params: {
            method: 'food.get',
            food_id: foodId,
            format: 'json'
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data.food;
};