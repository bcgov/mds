import {
    setQuery,
    setFilters,
    setDocumentLoading,
    setAiLoading,
    updateSearchResults,
    updatePromptResults,
    searchPermitConditions,
    selectSearchQuery,
    selectSearchFilters,
    selectSearchResults,
    selectSearchLoading,
    selectDocumentLoading,
    selectAiLoading,
    selectAllFacets,
    PermitSearchFilters
} from '@mds/common/redux/slices/permitSearchSlice';
import { getStore } from "@mds/common/redux/rootState";

const flushPromises = async () => {
    // Flush promises to ensure all async actions have completed
    // this is necessary because the searchPermitConditions action dispatches multiple async actions
    return new Promise(resolve => setTimeout(resolve, 0));
};

describe('permitSearchSlice', () => {

    describe('reducers and selectors', () => {
        it('should have the correct initial state', () => {
            const store = getStore();

            expect(selectSearchQuery(store.getState())).toBe('');
            expect(selectSearchFilters(store.getState())).toEqual([]);
            expect(selectSearchResults(store.getState())).toBeNull();
            expect(selectSearchLoading(store.getState())).toBeFalsy();
            expect(selectDocumentLoading(store.getState())).toBeFalsy();
            expect(selectAiLoading(store.getState())).toBeFalsy();
            expect(selectAllFacets(store.getState())).toEqual({});
        });

        it('should handle setQuery action', () => {
            const store = getStore();
            const testQuery = 'test query';

            store.dispatch(setQuery(testQuery));

            expect(selectSearchQuery(store.getState())).toBe(testQuery);
        });

        it('should handle setFilters action', () => {
            const store = getStore();
            const testFilters: PermitSearchFilters = [
                { category: 'Environmental', value: 'Water Quality' },
                { category: 'Safety', value: 'Equipment' }
            ];

            store.dispatch(setFilters(testFilters));

            expect(selectSearchFilters(store.getState())).toEqual(testFilters);
        });

        it('should handle setDocumentLoading action', () => {
            const store = getStore();

            store.dispatch(setDocumentLoading(true));
            expect(selectDocumentLoading(store.getState())).toBe(true);

            store.dispatch(setDocumentLoading(false));
            expect(selectDocumentLoading(store.getState())).toBe(false);
        });

        it('should handle setAiLoading action', () => {
            const store = getStore();

            store.dispatch(setAiLoading(true));
            expect(selectAiLoading(store.getState())).toBe(true);

            store.dispatch(setAiLoading(false));
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should handle updateSearchResults action', () => {
            const store = getStore();
            const mockResults = {
                documents: [{ content: 'test content', id: '1' }],
                facets: { category: [{ value: 'Environmental', count: 1 }] }
            };

            store.dispatch(updateSearchResults(mockResults as any));

            expect(selectSearchResults(store.getState())).toEqual(mockResults);
            expect(selectAllFacets(store.getState())).toEqual(mockResults.facets);
        });

        it('should preserve filters when updating search results', () => {
            const store = getStore();
            const testFilters: PermitSearchFilters = [
                { category: 'Environmental', value: 'Water Quality' }
            ];

            store.dispatch(setFilters(testFilters));

            const mockResults = {
                documents: [{ content: 'test content', id: '1' }],
                facets: { category: [{ value: 'Environmental', count: 1 }] }
            };

            store.dispatch(updateSearchResults(mockResults as any));

            expect(selectSearchFilters(store.getState())).toEqual(testFilters);
            expect(selectSearchResults(store.getState())).toEqual(mockResults);
        });

        it('should handle updatePromptResults action', () => {
            const store = getStore();
            const mockResults = {
                documents: [{ content: 'test content', id: '1' }],
                prompt: null
            };

            store.dispatch(updateSearchResults(mockResults as any));

            const promptData = { answers: ['test answer'] };
            store.dispatch(updatePromptResults(promptData as any));

            expect(selectSearchResults(store.getState())?.prompt).toEqual(promptData);
        });
    });

    describe('async actions', () => {
        it('should handle searchPermitConditions with water query', async () => {
            const store = getStore();

            const action = await store.dispatch(searchPermitConditions({
                query: 'water quality',
                filters: []
            }));

            expect(action.type).toContain('fulfilled');

            await flushPromises();

            const result = selectSearchResults(store.getState());
            expect(result).not.toBeNull();
            expect(result?.documents?.length).toBeGreaterThan(0);
            expect(selectDocumentLoading(store.getState())).toBe(false);

            expect(result?.prompt).not.toBeNull();
            expect(result?.prompt?.answers?.length).toBeGreaterThan(0);
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should handle searchPermitConditions with empty results', async () => {
            const store = getStore();

            const action = await store.dispatch(searchPermitConditions({
                query: 'nonexistent term',
                filters: []
            }));

            expect(action.type).toContain('fulfilled');

            await flushPromises();

            const result = selectSearchResults(store.getState());
            expect(result).not.toBeNull();
            expect(result?.documents).toEqual([]);
            expect(selectDocumentLoading(store.getState())).toBe(false);

            expect(result?.prompt?.answers).toEqual(undefined);
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should preserve filters when searching', async () => {
            const store = getStore();
            const testFilters: PermitSearchFilters = [
                { category: 'Environmental', value: 'Water Quality' }
            ];

            store.dispatch(setFilters(testFilters));

            await store.dispatch(searchPermitConditions({
                query: 'water quality',
                filters: testFilters
            }));

            await flushPromises();

            expect(selectSearchFilters(store.getState())).toEqual(testFilters);
            expect(selectSearchResults(store.getState())).not.toBeNull();
        });

        it('should update loading states during search lifecycle', async () => {
            const store = getStore();

            const promise = store.dispatch(searchPermitConditions({
                query: 'water quality',
                filters: []
            }));

            expect(selectSearchLoading(store.getState())).toBe(true);
            expect(selectDocumentLoading(store.getState())).toBe(true);

            await promise;
            await flushPromises();

            expect(selectSearchLoading(store.getState())).toBe(false);
            expect(selectDocumentLoading(store.getState())).toBe(false);
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should properly transition through loading states', async () => {
            const store = getStore();

            expect(selectSearchLoading(store.getState())).toBe(false);
            expect(selectDocumentLoading(store.getState())).toBe(false);
            expect(selectAiLoading(store.getState())).toBe(false);

            const searchPromise = store.dispatch(searchPermitConditions({
                query: 'water quality',
                filters: []
            }));

            expect(selectSearchLoading(store.getState())).toBe(true);
            expect(selectDocumentLoading(store.getState())).toBe(true);

            await searchPromise;
            await flushPromises();

            expect(selectSearchLoading(store.getState())).toBe(false);
            expect(selectDocumentLoading(store.getState())).toBe(false);
            expect(selectAiLoading(store.getState())).toBe(false);
        });
    });
});
