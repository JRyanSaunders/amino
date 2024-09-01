import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchFood } from '../services/fatSecretApi';

export const useFoodSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['foodSearch', searchTerm],
        queryFn: () => searchFood(searchTerm),
        enabled: searchTerm.length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        searchTerm,
        setSearchTerm,
        searchResults: data,
        isLoading,
        error,
    };
};