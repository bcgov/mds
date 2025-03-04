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
import CustomAxios from "@mds/common/redux/customAxios";

jest.mock("@mds/common/redux/customAxios");
const mockCustomAxiosInstance = {
    post: jest.fn()
};
(CustomAxios as jest.Mock).mockImplementation(() => mockCustomAxiosInstance);

jest.mock("@mds/common/utils/SseParser", () => {
    const originalModule = jest.requireActual("@mds/common/utils/SseParser");
    return {
        ...originalModule,
        createSseProcessor: jest.fn((stream, handlers, options) => {
            (global as any).sseHandlers = handlers;
            (global as any).sseOptions = options;
        })
    };
});

describe('permitSearchSlice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global as any).sseHandlers = null;
        (global as any).sseOptions = null;
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
            expect(state.streaming).toBeFalsy();
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
            // Setup mock ReadableStream response
            const mockReadableStream = { getReader: jest.fn() };
            mockCustomAxiosInstance.post.mockResolvedValue({
                data: mockReadableStream
            });

            const store = getStore();
            // Make sure store is in a clean state
            expect(selectSearchResults(store.getState())).toBeNull();

            // Dispatch the search action
            await store.dispatch(searchPermitConditions({ query: 'water quality', filters: [] }));

            // Get the stored handlers from our mock
            const handlers = (global as any).sseHandlers;
            const options = (global as any).sseOptions;

            // Simulate receiving document data
            handlers.documents({
                documents: [{ content: 'Water quality monitoring must be conducted monthly' }],
                facets: { category: [{ value: 'Environmental', count: 1 }] }
            });

            // Check document data was processed
            expect(selectSearchResults(store.getState())?.documents[0].content).toBe(
                'Water quality monitoring must be conducted monthly'
            );
            expect(selectDocumentLoading(store.getState())).toBe(false);

            // Simulate AI processing
            handlers.ai_start({});
            expect(selectAiLoading(store.getState())).toBe(true);

            // Simulate prompt results
            handlers.prompt({
                answers: ['The permit requires monthly water quality monitoring.']
            });

            // Check prompt results
            expect(selectSearchResults(store.getState())?.prompt?.answers[0]).toBe(
                'The permit requires monthly water quality monitoring.'
            );

            // Simulate AI completion
            handlers.ai_complete({});
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should handle errors in the SSE stream', async () => {
            const mockReadableStream = { getReader: jest.fn() };
            mockCustomAxiosInstance.post.mockResolvedValue({
                data: mockReadableStream
            });

            const store = getStore();
            await store.dispatch(searchPermitConditions({ query: 'water quality', filters: [] }));

            const options = (global as any).sseOptions;

            options.onError(new Error('Stream error'));

            expect(selectDocumentLoading(store.getState())).toBe(false);
            expect(selectAiLoading(store.getState())).toBe(false);
        });

        it('should preserve filters when updating search results', async () => {
            const store = getStore();
            const testFilters = [{ category: 'test', value: 'value' }];

            store.dispatch(setFilters(testFilters));

            const mockReadableStream = { getReader: jest.fn() };
            mockCustomAxiosInstance.post.mockResolvedValue({
                data: mockReadableStream
            });

            await store.dispatch(searchPermitConditions({ query: 'test', filters: testFilters }));

            const handlers = (global as any).sseHandlers;

            handlers.documents({
                documents: [{ content: 'Result content' }]
            });

            expect(selectSearchFilters(store.getState())).toEqual(testFilters);
        });
    });
});
