import {
    setQuery,
    setFilters,
    searchPermitConditions,
    selectSearchQuery,
    selectSearchFilters,
    selectSearchResults
} from '@mds/common/redux/slices/permitSearchSlice';
import { getStore } from "@mds/common/redux/rootState";

describe('permitSearchSlice', () => {

    describe('reducers', () => {
        it('should handle initial state', () => {
            const store = getStore();
            const state = store.getState().permitSearch;
            expect(state.query).toBe('');
            expect(state.filters).toEqual([]);
            expect(state.results).toBeNull();
            expect(state.loading).toBeFalsy();
        });

        it('should handle setQuery', async () => {
            const store = getStore();

            store.dispatch(setQuery('test query'));
            expect(selectSearchQuery(store.getState())).toBe('test query');
        });

        it('should handle setFilters', async () => {
            const store = getStore();

            const testFilters = [{ category: 'test', value: 'value' }];
            store.dispatch(setFilters(testFilters));
            expect(selectSearchFilters(store.getState())).toEqual(testFilters);
        });
    });

    describe('async actions', () => {
        it('should handle water quality search', async () => {
            const store = getStore();

            await store.dispatch(searchPermitConditions({ query: 'water quality' }));
            const results = selectSearchResults(store.getState());

            expect(results?.documents[0].content).toBe(
                'Water quality monitoring must be conducted monthly'
            );
            expect(results?.prompt.answers[0]).toBe(
                'The permit requires monthly water quality monitoring.'
            );
        });

        it('should handle empty search results', async () => {
            const store = getStore();

            await store.dispatch(searchPermitConditions({ query: 'nonexistent' }));
            const results = selectSearchResults(store.getState());

            expect(results?.documents).toHaveLength(0);
            expect(results?.prompt.answers).toHaveLength(0);
        });

        it('should accumulate facets across searches', async () => {
            const store = getStore();

            // First search - environmental facets
            await store.dispatch(searchPermitConditions({ query: 'water' }));
            const firstResults = selectSearchResults(store.getState());
            const firstFacets = firstResults?.facets?.category || [];

            expect(firstFacets.find(f => f.value === 'Environmental')?.count).toBe(1);

            // Second search should maintain facets from first search
            store.dispatch(searchPermitConditions({ query: 'safety' }));
            const secondResults = selectSearchResults(store.getState());
            const allFacets = secondResults?.allFacets?.category || [];
            expect(allFacets).toContainEqual(
                expect.objectContaining({ value: 'Environmental' })
            );
        });
    });
});
