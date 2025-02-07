import { useEffect, useRef } from 'react';
import { searchPermitConditions, setQuery as setReduxQuery, setFilters as setReduxFilters } from '@mds/common/redux/slices/permitSearchSlice';
import { FilterOperator, ConditionOperator } from '@mds/common/interfaces/search/facet-search.interface';
import { useAppDispatch, useAppSelector } from '@mds/common/redux/rootState';

const useSearch = () => {
    const dispatch = useAppDispatch();
    const { query, filters, results, loading } = useAppSelector((state) => state.permitSearch);
    const searchTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!query) return;

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            const filtersByCategory = filters.reduce((acc, filter) => {
                acc[filter.category] = acc[filter.category] || [];
                acc[filter.category].push(filter.value);
                return acc;
            }, {} as Record<string, string[]>);

            dispatch(searchPermitConditions({
                query,
                filters: filters.length > 0 ? {
                    operator: FilterOperator.AND,
                    conditions: Object.entries(filtersByCategory).map(([category, values]) => ({
                        field: category,
                        operator: ConditionOperator.IN,
                        value: values
                    }))
                } : undefined
            }));
        }, 300);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [query, filters, dispatch]);

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