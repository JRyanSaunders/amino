import { useState, useCallback } from 'react';

interface AsyncOperationResult<T> {
    execute: () => Promise<void>;
    loading: boolean;
    error: Error | null;
    data: T | null;
}

export function useAsyncOperation<T>(
    asyncFunction: () => Promise<T>
): AsyncOperationResult<T> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<T | null>(null);

    const execute = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await asyncFunction();
            setData(result);
        } catch (e) {
            setError(e instanceof Error ? e : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [asyncFunction]);

    return { execute, loading, error, data };
}