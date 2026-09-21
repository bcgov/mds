import {
    setNowQuery,
    setNowFilters,
    setNowDocumentLoading,
    setNowAiLoading,
    updateNowSearchResults,
    updateNowPromptResults,
    searchNowApplicationDocuments,
    indexNowApplicationDocuments,
    cancelNowIndexing,
    fetchNowIndexingStatus,
    clearNowSearch,
    selectNowSearchQuery,
    selectNowSearchFilters,
    selectNowSearchResults,
    selectNowSearchLoading,
    selectNowDocumentLoading,
    selectNowAiLoading,
    selectNowAllFacets,
    selectNowIndexing,
    selectNowCancelling,
    selectNowIndexerStatus,
    selectNowIndexerStatusLoading,
    NowApplicationSearchFilters,
    SearchEventType
} from '@mds/common/redux/slices/nowApplicationSearchSlice';
import { getStore } from "@mds/common/redux/rootState";
import CustomAxios from "@mds/common/redux/customAxios";
import { createEventSource } from "eventsource-client";

jest.mock('@mds/common/redux/customAxios', () => {
    const mockAxios = {
        post: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
    };
    return jest.fn(() => mockAxios);
});

jest.mock('eventsource-client', () => ({
    createEventSource: jest.fn(),
}));

const flushPromises = async () => {
    return new Promise(resolve => setTimeout(resolve, 0));
};

describe('nowApplicationSearchSlice', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

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
            expect(selectNowIndexing(store.getState())).toBeFalsy();
            expect(selectNowCancelling(store.getState())).toBeFalsy();
            expect(selectNowIndexerStatus(store.getState())).toBeNull();
            expect(selectNowIndexerStatusLoading(store.getState())).toBeFalsy();
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
                { category: 'Type', value: 'PDF' },
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
                facets: { category: [{ value: 'Type', count: 1 }] }
            };

            store.dispatch(updateNowSearchResults(mockResults as any));

            expect(selectNowSearchResults(store.getState())).toEqual(mockResults);
            expect(selectNowAllFacets(store.getState())).toEqual(mockResults.facets);
        });

        it('should preserve filters when updating search results', () => {
            const store = getStore();
            const testFilters: NowApplicationSearchFilters = [
                { category: 'Type', value: 'PDF' }
            ];

            store.dispatch(setNowFilters(testFilters));

            const mockResults = {
                documents: [{ content: 'test content', id: '1' }],
                facets: { category: [{ value: 'Type', count: 1 }] }
            };

            store.dispatch(updateNowSearchResults(mockResults as any));

            expect(selectNowSearchFilters(store.getState())).toEqual(testFilters);
            expect(selectNowSearchResults(store.getState())).toEqual(mockResults);
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

        it('should clear search state when navigating to a different application', () => {
            const store = getStore();

            store.dispatch(setNowQuery('max annual tonnage'));
            store.dispatch(setNowFilters([{ category: 'Type', value: 'PDF' }]));
            store.dispatch(updateNowSearchResults({ documents: [{ content: 'result', id: '1' }] } as any));

            // Navigate to a different application
            store.dispatch(clearNowSearch('different-guid'));

            expect(selectNowSearchQuery(store.getState())).toBe('');
            expect(selectNowSearchFilters(store.getState())).toEqual([]);
            expect(selectNowSearchResults(store.getState())).toBeNull();
            expect(selectNowAllFacets(store.getState())).toEqual({});
        });

        it('should preserve search state when returning to the same application', () => {
            const store = getStore();
            const guid = 'app-guid-123';

            // Simulate a completed search on this application
            store.dispatch(clearNowSearch(guid)); // sets the stored guid
            store.dispatch(setNowQuery('max annual tonnage'));
            store.dispatch(updateNowSearchResults({ documents: [{ content: 'result', id: '1' }] } as any));

            // Navigate away and back to the same application
            store.dispatch(clearNowSearch(guid));

            expect(selectNowSearchQuery(store.getState())).toBe('max annual tonnage');
            expect(selectNowSearchResults(store.getState())).not.toBeNull();
        });
    });
});

describe('async actions', () => {
    it('should handle indexNowApplicationDocuments', async () => {
        const store = getStore();
        const mockPost = jest.fn().mockResolvedValue({ data: {} });
        (CustomAxios as jest.Mock).mockReturnValue({ post: mockPost });

        const promise = store.dispatch(indexNowApplicationDocuments('test-guid'));

        // wait a tick for pending
        expect(selectNowIndexing(store.getState())).toBe(true);

        await promise;
        expect(mockPost).toHaveBeenCalled();
        expect(selectNowIndexing(store.getState())).toBe(false);
    });

    it('should handle cancelNowIndexing', async () => {
        const store = getStore();
        const mockDelete = jest.fn().mockResolvedValue({ data: {} });
        const mockGet = jest.fn().mockResolvedValue({ data: { status: 'cancelled' } });
        (CustomAxios as jest.Mock).mockReturnValue({ delete: mockDelete, get: mockGet });

        const promise = store.dispatch(cancelNowIndexing('test-guid'));

        expect(selectNowCancelling(store.getState())).toBe(true);

        await promise;
        expect(mockDelete).toHaveBeenCalled();
        expect(selectNowCancelling(store.getState())).toBe(false);
    });

    it('should handle fetchNowIndexingStatus', async () => {
        const store = getStore();
        const mockStatus = { status: 'success', items_processed: 5 };
        const mockGet = jest.fn().mockResolvedValue({ data: mockStatus });
        (CustomAxios as jest.Mock).mockReturnValue({ get: mockGet });

        const promise = store.dispatch(fetchNowIndexingStatus('test-guid'));

        expect(selectNowIndexerStatusLoading(store.getState())).toBe(true);

        await promise;
        expect(mockGet).toHaveBeenCalled();
        expect(selectNowIndexerStatusLoading(store.getState())).toBe(false);
        expect(selectNowIndexerStatus(store.getState())).toEqual(mockStatus);
    });

    it('should handle searchNowApplicationDocuments with SSE success', async () => {
        const store = getStore();
        let onMessageHandler: any;
        let onDisconnectHandler: any;

        const mockClose = jest.fn();

        (createEventSource as jest.Mock).mockImplementation((options) => {
            onMessageHandler = options.onMessage;
            onDisconnectHandler = options.onDisconnect;
            return { close: mockClose };
        });

        const promise = store.dispatch(searchNowApplicationDocuments({
            nowApplicationGuid: 'test-guid',
            query: 'test',
            filters: [{ category: 'Type', value: 'PDF' }]
        }));

        // trigger SSE events
        if (onMessageHandler) {
            onMessageHandler({ event: SearchEventType.AI_START, data: '{}' });
            expect(selectNowAiLoading(store.getState())).toBe(true);

            onMessageHandler({ event: SearchEventType.DOCUMENTS, data: JSON.stringify({ documents: [] }) });
            expect(selectNowDocumentLoading(store.getState())).toBe(false);

            onMessageHandler({ event: SearchEventType.PROMPT, data: JSON.stringify({ answers: ['answer'] }) });

            onMessageHandler({ event: SearchEventType.AI_COMPLETE, data: '{}' });
            expect(selectNowAiLoading(store.getState())).toBe(false);
        }

        if (onDisconnectHandler) {
            onDisconnectHandler();
        }

        await promise;
        expect(createEventSource).toHaveBeenCalled();
    });

    it('should handle searchNowApplicationDocuments with SSE error event', async () => {
        const store = getStore();
        let onMessageHandler: any;

        (createEventSource as jest.Mock).mockImplementation((options) => {
            onMessageHandler = options.onMessage;
            return { close: jest.fn() };
        });

        const promise = store.dispatch(searchNowApplicationDocuments({
            nowApplicationGuid: 'test-guid',
            query: 'test',
            filters: []
        }));

        if (onMessageHandler) {
            onMessageHandler({ event: SearchEventType.ERROR, data: JSON.stringify({ message: 'test error' }) });
        }

        await promise;

        expect(selectNowAiLoading(store.getState())).toBe(false);
        expect(selectNowDocumentLoading(store.getState())).toBe(false);
        const results = selectNowSearchResults(store.getState());
        expect(results?.prompt?.answers?.[0]).toEqual('test error');
    });

    it('should handle searchNowApplicationDocuments eventSource setup failure', async () => {
        const store = getStore();

        (createEventSource as jest.Mock).mockImplementation(() => {
            throw new Error("setup error");
        });

        try {
            await store.dispatch(searchNowApplicationDocuments({
                nowApplicationGuid: 'test-guid',
                query: 'test',
                filters: []
            })).unwrap();
        } catch (e) {
            // expected
        }

        expect(selectNowSearchLoading(store.getState())).toBe(false);
    });
});
