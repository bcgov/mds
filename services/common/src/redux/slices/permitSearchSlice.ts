import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { RootState } from "../rootState";
import { createRequestHeader } from "../utils/RequestHeaders";
import { ConditionOperator, Facet, FilterOperator, SearchQuery, SearchResult } from "@mds/common/interfaces/search/facet-search.interface";
import { createEventSource } from 'eventsource-client'

import * as API from "@mds/common/constants/API";
export const permitSearchReducerType = "permitSearch";

export type PermitSearchFilters = Array<{ category: string; value: string }>;
interface PermitSearchState {
    results: SearchResult | null;
    loading: boolean;
    documentLoading: boolean;
    aiLoading: boolean;
    query: string;
    filters: PermitSearchFilters;
    allFacets: { [key: string]: Facet[] };
}

const initialState: PermitSearchState = {
    results: null,
    loading: false,
    documentLoading: false,
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
            const existingFilters = state.filters;

            state.results = action.payload;

            if (action.payload.facets) {
                state.allFacets = action.payload.facets;
            }

            state.filters = existingFilters;
        }),
        updatePromptResults: create.reducer((state, action: { payload: any }) => {
            if (state.results) {
                state.results.prompt = action.payload;
            }
        }),
        setAiLoading: create.reducer((state, action: { payload: boolean }) => {
            state.aiLoading = action.payload;
        }),
        setDocumentLoading: create.reducer((state, action: { payload: boolean }) => {
            state.documentLoading = action.payload;
        }),
        /**
         * Search for permit condtions and parse the results from a Server-Sent Events stream (SSE).
         * 
         * Handles the following events sent by the server:
         *  - documents: Matching Permit Conditions
         *  - ai_start: Sent when the AI is processing the query
         *  - prompt: AI Generated result
         *  - ai_complete: Sent when the AI has finished processing the query
         */
        searchPermitConditions: create.asyncThunk(
            async (payload: { query: string, filters: PermitSearchFilters }, thunkApi) => {
                thunkApi.dispatch(showLoading());

                thunkApi.dispatch(setFilters(payload.filters));
                // Make sure we set document loading to true so skeleton appears
                thunkApi.dispatch(setDocumentLoading(true));
                thunkApi.dispatch(setAiLoading(true));
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

                const state = thunkApi.getState() as RootState;
                const currentFilters = state.permitSearch.filters;

                let eventSource = null;

                try {
                    eventSource = createEventSource({
                        url: `${ENVIRONMENT.apiUrl}${API.PERMIT_CONDITION_SEARCH}`,
                        body: JSON.stringify(searchQuery),
                        fetch: fetch,
                        method: 'POST',
                        headers: {
                            ...headers.headers,
                            'Accept': 'text/event-stream',
                            'Content-Type': 'application/json'
                        },

                        onMessage: ({ event, data }) => {

                            const payload = JSON.parse(data);
                            let updatedState: RootState = thunkApi.getState();

                            console.error('got event', event);
                            switch (event) {
                                case 'ai_start':
                                    thunkApi.dispatch(setAiLoading(true));
                                    break;
                                case 'documents':
                                    thunkApi.dispatch(updateSearchResults(payload));
                                    // Ensure we set loading to false when documents are received
                                    thunkApi.dispatch(setDocumentLoading(false));

                                    if (updatedState.permitSearch.filters.length === 0 && currentFilters.length > 0) {
                                        thunkApi.dispatch(setFilters(currentFilters));
                                    }
                                    break;
                                case 'prompt':
                                    thunkApi.dispatch(updatePromptResults(payload));
                                    break;
                                case 'ai_complete':
                                    thunkApi.dispatch(setAiLoading(false));
                                    break;
                            }
                        },

                        onDisconnect: () => {
                            eventSource.close();
                            thunkApi.dispatch(hideLoading());

                        }
                    });

                    return null;
                } catch (error) {
                    console.error('Search error:', error);
                    thunkApi.dispatch(hideLoading());
                    thunkApi.dispatch(setDocumentLoading(false));
                    thunkApi.dispatch(setAiLoading(false));

                    if (eventSource) {
                        eventSource.close();
                    }
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
                },
                rejected: (state) => {
                    state.loading = false;
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
    setAiLoading,
    setDocumentLoading
} = permitSearchSlice.actions;

export const {
    selectSearchQuery,
    selectSearchFilters,
    selectSearchResults,
    selectSearchLoading,
    selectAllFacets,
    selectAiLoading,
    selectDocumentLoading,
} = permitSearchSlice.selectors;

export default permitSearchSlice.reducer;
