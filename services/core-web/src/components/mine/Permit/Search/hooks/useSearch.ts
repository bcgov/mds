import { useState, useEffect } from 'react';
import { searchApi } from '../services/searchApi';
import { SearchResult } from '../services/types';

const useSearch = () => {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<SearchResult>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (searchQuery: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await searchApi({ query: searchQuery });
            setResults(data);
        } catch (err) {
            setError('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (query) {
            handleSearch(query);
        }
    }, [query]);

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        handleSearch,
    };
};

export default useSearch;