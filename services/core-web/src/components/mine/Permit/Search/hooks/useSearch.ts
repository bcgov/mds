import { useState, useEffect, useCallback, useRef } from 'react';
import { searchApi } from '../services/searchApi';
import { SearchResult, SearchQuery, FilterOperator, ConditionOperator } from '../services/types';

const useSearch = () => {
    const [query, setQuery] = useState<string>('');
    const [filters, setFilters] = useState<Array<{ category: string; value: string }>>([]);
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const searchTimeout = useRef<NodeJS.Timeout>();

    const handleSearch = useCallback(async (searchQuery: string, currentFilters: typeof filters) => {
        if (!searchQuery.trim()) return;

        setLoading(true);

        // Group filters by category
        const filtersByCategory = currentFilters.reduce((acc, filter) => {
            acc[filter.category] = acc[filter.category] || [];
            acc[filter.category].push(filter.value);
            return acc;
        }, {} as Record<string, string[]>);

        try {
            const data = await searchApi({
                query: searchQuery,
                filters: currentFilters.length > 0 ? {
                    operator: FilterOperator.AND,
                    conditions: Object.entries(filtersByCategory).map(([category, values]) => ({
                        field: category,
                        operator: ConditionOperator.IN,
                        value: values
                    }))
                } : undefined
            });

            // Merge new facets with existing ones
            const currentFacets = data.facets || {};
            const existingAllFacets = results?.allFacets || {};

            setResults({
                ...data,
                allFacets: {
                    ...existingAllFacets,
                    ...Object.fromEntries(
                        Object.entries(currentFacets).map(([key, values]) => [
                            key,
                            Array.from(
                                new Map([
                                    ...(existingAllFacets[key] || []),
                                    ...values
                                ].map(item => [item.value, item])).values()
                            )
                        ])
                    )
                }
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!query) return;

        setLoading(true);

        // Clear any existing timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // Set new timeout
        searchTimeout.current = setTimeout(() => {
            handleSearch(query, filters);
        }, 300);

        // Cleanup
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [query, filters, handleSearch]);

    return {
        query,
        setQuery,
        filters,
        setFilters,
        results,
        loading,
    };
};

export default useSearch;