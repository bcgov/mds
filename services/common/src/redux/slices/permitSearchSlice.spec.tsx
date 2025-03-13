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
    selectDocumentLoading,
    selectAiLoading
} from '@mds/common/redux/slices/permitSearchSlice';
import { getStore } from "@mds/common/redux/rootState";
import { createEventSource } from 'eventsource-client';

jest.mock('eventsource-client', () => ({
    createEventSource: jest.fn()
}));

describe('permitSearchSlice', () => {
    let mockEventSource: any;
    let onMessageCallback: any;
    let onDisconnectCallback: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockEventSource = {
            close: jest.fn()
        };

        (createEventSource as jest.Mock).mockImplementation(({ onMessage, onDisconnect }) => {
            onMessageCallback = onMessage;
            onDisconnectCallback = onDisconnect;
            return mockEventSource;
        });
    });

    describe('reducers', () => {
        it('should handle initial state', () => {
            const store = getStore();
            const state = store.getState().permitSearch;
            expect(state.query).toBe('');
            expect(state.filters).toEqual([]);
            expect(state.results).toBeNull();
            expect(state.loading).toBeFalsy();
            expect(state.documentLoading).toBeFalsy();
            expect(state.aiLoading).toBeFalsy();
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

        it('should handle setDocumentLoading', async () => {
            const store = getStore();

            store.dispatch(setDocumentLoading(true));
            expect(selectDocumentLoading(store.getState())).toBe(true);

            store.dispatch(setDocumentLoading(false));
            expect(selectDocumentLoading(store.getState())).toBe(false);
        });

        it('should handle setAiLoading', async () => {
            const store = getStore();

            store.dispatch(setAiLoading(true));
            expect(selectAiLoading(store.getState())).toBe(true);

            store.dispatch(setAiLoading(false));
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should handle updateSearchResults', async () => {
            const store = getStore();

            const mockResults = {
                documents: [{ content: 'test content' }],
                facets: { category: [{ value: 'Environmental', count: 1 }] }
            };
            store.dispatch(updateSearchResults(mockResults as any));

            expect(selectSearchResults(store.getState())).toEqual(mockResults);
        });

        it('should handle updatePromptResults', async () => {
            const store = getStore();

            const mockResults = {
                documents: [{ content: 'test content' }],
                prompt: null
            };
            store.dispatch(updateSearchResults(mockResults as any));

            const promptData = { answers: ['test answer'] };
            store.dispatch(updatePromptResults(promptData as any));

            expect(selectSearchResults(store.getState())?.prompt).toEqual(promptData);
        });
    });

    describe('async actions', () => {
        it('should handle SSE search with documents and prompt events', async () => {
            const store = getStore();
            expect(selectSearchResults(store.getState())).toBeNull();

            const searchPromise = store.dispatch(searchPermitConditions({ query: 'water quality', filters: [] }));

            onMessageCallback({
                event: 'documents',
                data: JSON.stringify({
                    documents: [{ content: 'Water quality monitoring must be conducted monthly' }],
                    facets: { category: [{ value: 'Environmental', count: 1 }] }
                })
            });

            expect(selectSearchResults(store.getState())?.documents[0].content).toBe(
                'Water quality monitoring must be conducted monthly'
            );
            expect(selectDocumentLoading(store.getState())).toBe(false);

            onMessageCallback({
                event: 'ai_start',
                data: '{}'
            });
            expect(selectAiLoading(store.getState())).toBe(true);

            onMessageCallback({
                event: 'prompt',
                data: JSON.stringify({
                    answers: ['The permit requires monthly water quality monitoring.']
                })
            });

            expect(selectSearchResults(store.getState())?.prompt?.answers[0]).toBe(
                'The permit requires monthly water quality monitoring.'
            );

            onMessageCallback({
                event: 'ai_complete',
                data: '{}'
            });
            expect(selectAiLoading(store.getState())).toBe(false);

            onDisconnectCallback();
            await searchPromise;

            expect(mockEventSource.close).toHaveBeenCalled();
        });

        it('should handle errors in the SSE stream', async () => {
            const store = getStore();

            (createEventSource as jest.Mock).mockImplementation(() => {
                throw new Error('Stream error');
            });

            const result = await store.dispatch(searchPermitConditions({
                query: 'water quality',
                filters: []
            }));

            expect(result.type).toContain('rejected');
            expect((result as any).error.message).toBe('Stream error');

            expect(selectDocumentLoading(store.getState())).toBe(false);
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should preserve filters when updating search results', async () => {
            const store = getStore();
            const testFilters = [{ category: 'test', value: 'value' }];

            store.dispatch(setFilters(testFilters));

            const searchPromise = store.dispatch(searchPermitConditions({ query: 'test', filters: testFilters }));

            onMessageCallback({
                event: 'documents',
                data: JSON.stringify({
                    documents: [{ content: 'Result content' }]
                })
            });

            expect(selectSearchFilters(store.getState())).toEqual(testFilters);

            onDisconnectCallback();
            await searchPromise;
        });
    });
});
