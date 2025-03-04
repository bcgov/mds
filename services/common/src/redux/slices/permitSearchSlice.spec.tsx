import {
    setQuery,
    setFilters,
    setStreaming,
    setDocumentLoading,
    setAiLoading,
    updateSearchResults,
    updatePromptResults,
    searchPermitConditions,
    selectSearchQuery,
    selectSearchFilters,
    selectSearchResults,
    selectSearchStreaming,
    selectDocumentLoading,
    selectAiLoading
} from '@mds/common/redux/slices/permitSearchSlice';
import { getStore } from "@mds/common/redux/rootState";
import CustomAxios from "@mds/common/redux/customAxios";

// Mock CustomAxios
jest.mock("@mds/common/redux/customAxios");
const mockCustomAxiosInstance = {
    post: jest.fn()
};
(CustomAxios as jest.Mock).mockImplementation(() => mockCustomAxiosInstance);

// Mock the fetch stream reader
const mockReader = {
    read: jest.fn(),
    cancel: jest.fn()
};

// Mock TextDecoderStream
global.TextDecoderStream = jest.fn().mockImplementation(() => ({
    readable: {
        getReader: () => mockReader
    },
    writable: {}
}));

describe('permitSearchSlice', () => {

    beforeEach(() => {
        jest.clearAllMocks();
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

        it('should handle setStreaming', async () => {
            const store = getStore();

            store.dispatch(setStreaming(true));
            expect(selectSearchStreaming(store.getState())).toBe(true);

            store.dispatch(setStreaming(false));
            expect(selectSearchStreaming(store.getState())).toBe(false);
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
            // Setup mock stream response
            const mockStream = {
                pipeThrough: jest.fn().mockReturnValue({
                    getReader: () => mockReader
                })
            };

            mockCustomAxiosInstance.post.mockResolvedValue({
                data: mockStream
            });

            // Create actual document data that can be parsed correctly
            const documentData = JSON.stringify({
                documents: [{ content: "Water quality monitoring must be conducted monthly" }],
                facets: { category: [{ value: "Environmental", count: 1 }] }
            });

            const promptData = JSON.stringify({
                answers: ["The permit requires monthly water quality monitoring."]
            });

            // Setup mock read responses for SSE events with valid JSON data
            // Format with no newline between event: and data: to match actual format
            mockReader.read
                .mockResolvedValueOnce({
                    value: `event: documents data: ${documentData}ENDMESSAGE`,
                    done: false
                })
                .mockResolvedValueOnce({
                    value: 'event: ai_start data: {}ENDMESSAGE',
                    done: false
                })
                .mockResolvedValueOnce({
                    value: `event: prompt data: ${promptData}ENDMESSAGE`,
                    done: false
                })
                .mockResolvedValueOnce({
                    value: 'event: ai_complete data: {}ENDMESSAGE',
                    done: false
                })
                .mockResolvedValueOnce({
                    value: 'event: complete data: {}ENDMESSAGE',
                    done: false
                })
                .mockResolvedValueOnce({ done: true });

            const store = getStore();

            // Make sure store is in a clean state
            expect(selectSearchResults(store.getState())).toBeNull();

            // Dispatch the search action
            await store.dispatch(searchPermitConditions({ query: 'water quality', filters: [] }));

            // Wait for all promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            // Check final state
            const results = selectSearchResults(store.getState());
            expect(results).not.toBeNull();
            expect(results?.documents).toHaveLength(1);
            expect(results?.documents[0].content).toBe('Water quality monitoring must be conducted monthly');
            expect(results?.prompt?.answers[0]).toBe('The permit requires monthly water quality monitoring.');
            expect(selectDocumentLoading(store.getState())).toBe(false);
            expect(selectAiLoading(store.getState())).toBe(false);
            expect(selectSearchStreaming(store.getState())).toBe(false);
        });

        it('should handle SSE events that come in separate chunks', async () => {
            // Setup mock stream response
            const mockStream = { pipeThrough: jest.fn().mockReturnValue({ getReader: () => mockReader }) };
            mockCustomAxiosInstance.post.mockResolvedValue({
                data: mockStream
            });

            // First part of a valid JSON document - no newline between event: and data:
            const firstChunk = 'event: documents data: {"documents":';
            // Second part completing the JSON
            const secondChunk = '[{"content":"Water quality monitoring must be conducted monthly"}],"facets":{"category":[{"value":"Environmental","count":1}]}}ENDMESSAGE';

            // Valid prompt data - no newline between event: and data:
            const promptData = JSON.stringify({
                answers: ["The permit requires monthly water quality monitoring."]
            });

            // Simulate partial events coming in separate chunks
            mockReader.read
                .mockResolvedValueOnce({ value: firstChunk, done: false })
                .mockResolvedValueOnce({ value: secondChunk, done: false })
                .mockResolvedValueOnce({ value: `event: prompt data: ${promptData}ENDMESSAGE`, done: false })
                .mockResolvedValueOnce({ value: 'event: complete data: {}ENDMESSAGE', done: false })
                .mockResolvedValueOnce({ done: true });

            const store = getStore();
            await store.dispatch(searchPermitConditions({ query: 'water quality', filters: [] }));

            // Wait for all promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            // Check that results were properly assembled despite the chunked response
            const results = selectSearchResults(store.getState());
            expect(results).not.toBeNull();
            expect(results?.documents).toHaveLength(1);
            expect(results?.documents[0].content).toBe('Water quality monitoring must be conducted monthly');
            expect(results?.prompt?.answers[0]).toBe('The permit requires monthly water quality monitoring.');
        });

        it('should handle errors in the SSE stream', async () => {
            // Setup mock stream response
            const mockStream = { pipeThrough: jest.fn().mockReturnValue({ getReader: () => mockReader }) };
            mockCustomAxiosInstance.post.mockResolvedValue({
                data: mockStream
            });

            // Simulate an error event - no newline between event: and data:
            mockReader.read
                .mockResolvedValueOnce({ value: 'event: error data: {"message":"Server error"}ENDMESSAGE', done: false })
                .mockResolvedValueOnce({ done: true });

            const store = getStore();
            await store.dispatch(searchPermitConditions({ query: 'water quality', filters: [] }));

            // Check that loading states are reset after error
            expect(selectDocumentLoading(store.getState())).toBe(false);
            expect(selectAiLoading(store.getState())).toBe(false);
            expect(selectSearchStreaming(store.getState())).toBe(false);
        });

        it('should preserve filters when updating search results', async () => {
            const store = getStore();
            const testFilters = [{ category: 'test', value: 'value' }];

            // Set initial filters
            store.dispatch(setFilters(testFilters));

            // Setup mock stream response
            const mockStream = { pipeThrough: jest.fn().mockReturnValue({ getReader: () => mockReader }) };
            mockCustomAxiosInstance.post.mockResolvedValue({
                data: mockStream
            });

            // No newline between event: and data:
            mockReader.read
                .mockResolvedValueOnce({ value: 'event: documents data: {"documents":[{"content":"Result content"}]}ENDMESSAGE', done: false })
                .mockResolvedValueOnce({ value: 'event: complete data: {}ENDMESSAGE', done: false })
                .mockResolvedValueOnce({ done: true });

            await store.dispatch(searchPermitConditions({ query: 'test', filters: testFilters }));

            // Check that filters are preserved after results update
            expect(selectSearchFilters(store.getState())).toEqual(testFilters);
        });
    });
});
