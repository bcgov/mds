import { useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { searchPermitConditions, setQuery as setReduxQuery, setFilters as setReduxFilters } from '@mds/common/redux/slices/permitSearchSlice';
import { FilterOperator, ConditionOperator } from '@mds/common/interfaces/search/facet-search.interface';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';

const useSearch = () => {
    const dispatch = useAppDispatch();
    const { query, filters, results, loading } = useAppSelector((state) => state.permitSearch);

    // Create a memoized search function
    const debouncedSearch = useCallback(
        debounce((searchQuery: string, searchFilters: typeof filters) => {
            const filtersByCategory: { [key: string]: string[] } = searchFilters.reduce((acc, filter) => {
                acc[filter.category] = acc[filter.category] || [];
                acc[filter.category].push(filter.value);
                return acc;
            }, {} as Record<string, string[]>);

            dispatch(searchPermitConditions({
                query: searchQuery,
                filters: searchFilters.length > 0 ? {
                    operator: FilterOperator.AND,
                    conditions: Object.entries(filtersByCategory).map(([category, values]) => ({
                        field: category,
                        operator: ConditionOperator.IN,
                        value: values
                    }))
                } : undefined
            }));
        }, 300),
        [dispatch]
    );

    useEffect(() => {
        if (!query) return;
        debouncedSearch(query, filters);

        return () => {
            debouncedSearch.cancel();
        };
    }, [query, filters, debouncedSearch]);

    return {
        query,
        setQuery: (value: string) => dispatch(setReduxQuery(value)),
        filters,
        setFilters: (value: Array<{ category: string; value: string }>) => dispatch(setReduxFilters(value)),
        results,
        loading,
    };
};

export default useSearch;