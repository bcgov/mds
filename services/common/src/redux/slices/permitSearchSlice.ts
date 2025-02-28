import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { RootState } from "../rootState";
import { createRequestHeader } from "../utils/RequestHeaders";
import { ConditionOperator, Facet, FilterOperator, SearchQuery, SearchResult, SelectedFilters } from "@mds/common/interfaces/search/facet-search.interface";

export const permitSearchReducerType = "permitSearch";

export type PermitSearchFilters = Array<{ category: string; value: string }>;
interface PermitSearchState {
    results: SearchResult | null;
    loading: boolean;
    documentLoading: boolean; // New state for document loading
    aiLoading: boolean;  // Already existing state for AI loading
    streaming: boolean;
    query: string;
    filters: PermitSearchFilters;
    allFacets: { [key: string]: Facet[] };
}

const initialState: PermitSearchState = {
    results: null,
    loading: false,
    documentLoading: false, // Add initial state
    streaming: false,
    query: '',
    filters: [],
    allFacets: {},
    aiLoading: false,
};

const permitSearchSlice = createAppSlice({
    name: permitSearchReducerType,
    initialState,
    reducers: (create) => ({
        setQuery: create.reducer((state, action: { payload: string }) => {
            state.query = action.payload;
        }),
        setFilters: create.reducer((state, action: { payload: PermitSearchFilters }) => {
            state.filters = action.payload;
        }),
        updateSearchResults: create.reducer((state, action: { payload: SearchResult }) => {
            // Preserve existing filters when updating results
            const existingFilters = state.filters;

            state.results = action.payload;

            // Store facets from the search results if they exist
            if (action.payload.facets) {
                state.allFacets = action.payload.facets;
            }

            // Ensure filters are preserved after results update
            state.filters = existingFilters;
        }),
        updatePromptResults: create.reducer((state, action: { payload: any }) => {
            if (state.results) {
                state.results.prompt = action.payload;
            }
        }),
        setStreaming: create.reducer((state, action: { payload: boolean }) => {
            state.streaming = action.payload;
        }),
        setAiLoading: create.reducer((state, action: { payload: boolean }) => {
            state.aiLoading = action.payload;
        }),
        setDocumentLoading: create.reducer((state, action: { payload: boolean }) => {
            state.documentLoading = action.payload;
        }),
        searchPermitConditions: create.asyncThunk(
            async (payload: { query: string, filters: PermitSearchFilters }, thunkApi) => {
                thunkApi.dispatch(showLoading());

                // Store filters at the start - this is important
                thunkApi.dispatch(setFilters(payload.filters));

                thunkApi.dispatch(setStreaming(true));
                thunkApi.dispatch(setDocumentLoading(true)); // Start document loading
                thunkApi.dispatch(setAiLoading(false)); // Reset AI loading
                thunkApi.dispatch(setQuery(payload.query));

                const headers = createRequestHeader();

                const filtersByCategory: Record<string, string[]> = payload.filters.reduce((acc, filter) => {
                    acc[filter.category] = acc[filter.category] || [];
                    acc[filter.category].push(filter.value);
                    return acc;
                }, {} as Record<string, string[]>);

                const searchQuery: SearchQuery = {
                    query: payload.query,
                    filters: payload.filters.length > 0 ? {
                        operator: FilterOperator.AND,
                        conditions: Object.entries(filtersByCategory).map(([category, values]) => ({
                            field: category,
                            operator: ConditionOperator.IN,
                            value: values
                        }))
                    } : undefined
                };

                try {
                    const response = await CustomAxios().post(
                        `${ENVIRONMENT.apiUrl}/search/permit-conditions`,
                        searchQuery,
                        {
                            ...headers,
                            headers: {
                                ...headers.headers,
                                'Accept': 'text/event-stream',
                            },
                            responseType: 'stream',
                            adapter: 'fetch',
                        }
                    );

                    const stream = response.data;
                    const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
                    let buffer = '';

                    console.log("Starting to read search stream...");

                    // Parse events using ENDMESSAGE delimiter instead of relying on newlines
                    const parseEvents = (input: string) => {
                        console.log("Parsing buffer:", input.substring(0, 100) + (input.length > 100 ? '...' : ''));

                        // Split by ENDMESSAGE and process each complete message
                        const messageParts = input.split('ENDMESSAGE');
                        const events: Array<{ type: string, data: string }> = [];

                        // Process all complete messages (all but the last part which might be incomplete)
                        for (let i = 0; i < messageParts.length - 1; i++) {
                            const message = messageParts[i].trim();
                            if (!message || message.startsWith(':')) continue; // Skip empty or comment lines
                            const [_, eventMatch, dataMatch] = message.match(/event:\s*([^\n]+)data:\s*([^\n]+)/) || [];
                            if (eventMatch && dataMatch) {
                                const eventType = eventMatch.trim();
                                const eventData = dataMatch.trim();
                                events.push({ type: eventType, data: eventData });
                            }
                        }

                        // Return both the events and the remaining part that might be incomplete
                        return {
                            events,
                            remainingBuffer: messageParts[messageParts.length - 1]
                        };
                    };

                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) {
                            console.log("Stream ended");
                            break;
                        }

                        buffer += value;

                        // Only process if we have at least one complete message
                        if (buffer.includes('ENDMESSAGE')) {
                            console.log(`Processing buffer chunk with ${buffer.split('ENDMESSAGE').length - 1} potential messages`);

                            const { events, remainingBuffer } = parseEvents(buffer);
                            console.log(`Found ${events.length} complete events`);

                            // Process each event
                            for (const event of events) {
                                try {
                                    console.log(`Processing event type: ${event.type}`);

                                    switch (event.type) {
                                        case 'documents':
                                            const documentsData: SearchResult = JSON.parse(event.data);
                                            console.log("Documents received:", documentsData?.documents?.length || 0);

                                            // Log facets received from API
                                            if (documentsData.facets) {
                                                console.log("Facets received:", Object.keys(documentsData.facets).length);
                                            } else {
                                                console.warn("No facets received in search results");
                                            }

                                            // Add a check to ensure filters are preserved
                                            const state = thunkApi.getState() as RootState;
                                            const currentFilters = state.permitSearch.filters;
                                            console.log('Current filters before updating results:', currentFilters);

                                            console.log(documentsData)

                                            // Update search results which will also store facets
                                            thunkApi.dispatch(updateSearchResults(documentsData));
                                            thunkApi.dispatch(setDocumentLoading(false)); // End document loading when received

                                            // Double-check filters after results update
                                            const newState = thunkApi.getState() as RootState;
                                            console.log('Filters after updating results:', newState.permitSearch.filters);

                                            // If filters were lost, reapply them
                                            if (newState.permitSearch.filters.length === 0 && currentFilters.length > 0) {
                                                console.log('Filters were lost! Reapplying:', currentFilters);
                                                thunkApi.dispatch(setFilters(currentFilters));
                                            }
                                            break;

                                        case 'ai_start':
                                            console.log("AI processing started");
                                            thunkApi.dispatch(setAiLoading(true));
                                            break;

                                        case 'prompt':
                                            const promptData = JSON.parse(event.data);
                                            console.log("Prompt response received");
                                            thunkApi.dispatch(updatePromptResults(promptData));
                                            break;

                                        case 'ai_complete':
                                            console.log("AI processing completed");
                                            thunkApi.dispatch(setAiLoading(false));
                                            break;

                                        case 'complete':
                                            console.log("Search completed");
                                            thunkApi.dispatch(setStreaming(false));
                                            // Force a reader.cancel() to end the stream properly
                                            reader.cancel("Stream complete");
                                            break;

                                        case 'error':
                                            console.error('Error from server:', event.data);
                                            thunkApi.dispatch(setStreaming(false));
                                            // Force a reader.cancel() to end the stream properly
                                            reader.cancel("Stream error");
                                            break;
                                    }
                                } catch (e) {
                                    console.error(`Error processing event ${event.type}:`, e);
                                    console.error("Event data:", event.data);
                                }
                            }

                            // Keep only the part that might be an incomplete message
                            buffer = remainingBuffer;
                        }
                    }

                    thunkApi.dispatch(hideLoading());
                    thunkApi.dispatch(setStreaming(false));
                    return null;
                } catch (error) {
                    console.error('Search error:', error);
                    thunkApi.dispatch(hideLoading());
                    thunkApi.dispatch(setStreaming(false));
                    thunkApi.dispatch(setDocumentLoading(false));
                    thunkApi.dispatch(setAiLoading(false));
                    throw error;
                }
            },
            {
                pending: (state) => {
                    state.loading = true;
                    state.documentLoading = true;
                    state.aiLoading = false;
                    state.results = null;
                },
                fulfilled: (state) => {
                    state.loading = false;
                    state.documentLoading = false;
                },
                rejected: (state) => {
                    state.loading = false;
                    state.streaming = false;
                    state.documentLoading = false;
                    state.aiLoading = false;
                },
            }
        ),
    }),
    selectors: {
        selectSearchQuery: (state: PermitSearchState): string => state.query,
        selectSearchFilters: (state: PermitSearchState): Array<{ category: string; value: string }> => state.filters,
        selectSearchResults: (state: PermitSearchState): SearchResult | null => state.results,
        selectSearchLoading: (state: PermitSearchState): boolean => state.loading,
        selectAllFacets: (state: PermitSearchState): { [key: string]: Facet[] } => state.allFacets,
        selectSearchStreaming: (state: PermitSearchState): boolean => state.streaming,
        selectAiLoading: (state: PermitSearchState): boolean => state.aiLoading,
        selectDocumentLoading: (state: PermitSearchState): boolean => state.documentLoading,
    },
});

export const {
    searchPermitConditions,
    setQuery,
    setFilters,
    updateSearchResults,
    updatePromptResults,
    setStreaming,
    setAiLoading,
    setDocumentLoading
} = permitSearchSlice.actions;

export const {
    selectSearchQuery,
    selectSearchFilters,
    selectSearchResults,
    selectSearchLoading,
    selectAllFacets,
    selectSearchStreaming,
    selectAiLoading,
    selectDocumentLoading,
} = permitSearchSlice.selectors;

export default permitSearchSlice.reducer;
