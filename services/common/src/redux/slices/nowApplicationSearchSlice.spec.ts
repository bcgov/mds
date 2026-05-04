import {
    setNowQuery,
    setNowFilters,
    setNowDocumentLoading,
    setNowAiLoading,
    updateNowSearchResults,
    updateNowPromptResults,
    selectNowSearchQuery,
    selectNowSearchFilters,
    selectNowSearchResults,
    selectNowSearchLoading,
    selectNowDocumentLoading,
    selectNowAiLoading,
    selectNowAllFacets,
    NowApplicationSearchFilters
} from '@mds/common/redux/slices/nowApplicationSearchSlice';
import { getStore } from "@mds/common/redux/rootState";

describe('nowApplicationSearchSlice', () => {

    describe('reducers and selectors', () => {
        it('should have the correct initial state', () => {
            const store = getStore();

            expect(selectNowSearchQuery(store.getState())).toBe('');
            expect(selectNowSearchFilters(store.getState())).toEqual([]);
            expect(selectNowSearchResults(store.getState())).toBeNull();
            expect(selectNowSearchLoading(store.getState())).toBeFalsy();
            expect(selectNowDocumentLoading(store.getState())).toBeFalsy();
            expect(selectNowAiLoading(store.getState())).toBeFalsy();
            expect(selectNowAllFacets(store.getState())).toEqual({});
        });

        it('should handle setNowQuery action', () => {
            const store = getStore();
            const testQuery = 'test query';

            store.dispatch(setNowQuery(testQuery));

            expect(selectNowSearchQuery(store.getState())).toBe(testQuery);
        });

        it('should handle setNowFilters action', () => {
            const store = getStore();
            const testFilters: NowApplicationSearchFilters = [
                { category: 'document_type', value: 'Report' }
            ];

            store.dispatch(setNowFilters(testFilters));

            expect(selectNowSearchFilters(store.getState())).toEqual(testFilters);
        });

        it('should handle setNowDocumentLoading action', () => {
            const store = getStore();

            store.dispatch(setNowDocumentLoading(true));
            expect(selectNowDocumentLoading(store.getState())).toBe(true);

            store.dispatch(setNowDocumentLoading(false));
            expect(selectNowDocumentLoading(store.getState())).toBe(false);
        });

        it('should handle setNowAiLoading action', () => {
            const store = getStore();

            store.dispatch(setNowAiLoading(true));
            expect(selectNowAiLoading(store.getState())).toBe(true);

            store.dispatch(setNowAiLoading(false));
            expect(selectNowAiLoading(store.getState())).toBe(false);
        });

        it('should handle updateNowSearchResults action', () => {
            const store = getStore();
            const mockResults = {
                documents: [{ content: 'test content', id: '1' }],
                facets: { document_type: [{ value: 'Report', count: 1 }] }
            };

            store.dispatch(updateNowSearchResults(mockResults as any));

            expect(selectNowSearchResults(store.getState())).toEqual(mockResults);
            expect(selectNowAllFacets(store.getState())).toEqual(mockResults.facets);
        });

        it('should handle updateNowPromptResults action', () => {
            const store = getStore();
            const mockResults = {
                documents: [{ content: 'test content', id: '1' }],
                prompt: null
            };

            store.dispatch(updateNowSearchResults(mockResults as any));

            const promptData = { answers: ['test answer'] };
            store.dispatch(updateNowPromptResults(promptData as any));

            expect(selectNowSearchResults(store.getState())?.prompt).toEqual(promptData);
        });
    });
});
