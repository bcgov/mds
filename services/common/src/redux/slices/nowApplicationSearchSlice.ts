import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { RootState } from "../rootState";
import { createRequestHeader } from "../utils/RequestHeaders";
import {
  ConditionOperator,
  Facet,
  FilterOperator,
  HaystackPromptSearchResult,
  SearchQuery,
  SearchResult,
} from "@mds/common/interfaces/search/facet-search.interface";
import { createEventSource } from "eventsource-client";
import * as API from "@mds/common/constants/API";

export const nowApplicationSearchReducerType = "nowApplicationSearch";

export enum SearchEventType {
  DOCUMENTS = "documents",
  AI_START = "ai_start",
  PROMPT = "prompt",
  AI_COMPLETE = "ai_complete",
  COMPLETE = "complete",
  ERROR = "error",
}

export type NowApplicationSearchFilters = Array<{ category: string; value: string }>;

interface NowApplicationSearchState {
  results: SearchResult | null;
  loading: boolean;
  documentLoading: boolean;
  aiLoading: boolean;
  query: string;
  filters: NowApplicationSearchFilters;
  allFacets: { [key: string]: Facet[] };
  nowApplicationGuid: string | null;
}

const initialState: NowApplicationSearchState = {
  results: null,
  loading: false,
  documentLoading: false,
  aiLoading: false,
  query: "",
  filters: [],
  allFacets: {},
  nowApplicationGuid: null,
};

const nowApplicationSearchSlice = createAppSlice({
  name: nowApplicationSearchReducerType,
  initialState,
  reducers: (create) => ({
    setNowQuery: create.reducer((state, action: { payload: string }) => {
      state.query = action.payload;
    }),
    setNowFilters: create.reducer((state, action: { payload: NowApplicationSearchFilters }) => {
      state.filters = action.payload;
    }),
    updateNowSearchResults: create.reducer((state, action: { payload: SearchResult }) => {
      const existingFilters = state.filters;
      state.results = action.payload;
      if (action.payload.facets) {
        state.allFacets = action.payload.facets;
      }
      state.filters = existingFilters;
    }),
    updateNowPromptResults: create.reducer(
      (state, action: { payload: HaystackPromptSearchResult }) => {
        if (state.results) {
          state.results.prompt = action.payload;
        }
      }
    ),
    setNowAiLoading: create.reducer((state, action: { payload: boolean }) => {
      state.aiLoading = action.payload;
    }),
    setNowDocumentLoading: create.reducer((state, action: { payload: boolean }) => {
      state.documentLoading = action.payload;
    }),

    /**
     * Search documents within a specific NoW application.
     *
     * The now_application_guid is passed to the API as a URL path segment — it is
     * never part of the query body. The server enforces the isolation filter, so
     * results are guaranteed to be scoped to this application only.
     *
     * Handles the same SSE event stream as permit search:
     *   documents → ai_start → prompt → ai_complete
     */
    searchNowApplicationDocuments: create.asyncThunk(
      async (
        payload: {
          nowApplicationGuid: string;
          query: string;
          filters: NowApplicationSearchFilters;
        },
        thunkApi
      ) => {
        thunkApi.dispatch(showLoading());
        thunkApi.dispatch(setNowFilters(payload.filters));
        thunkApi.dispatch(setNowDocumentLoading(true));
        thunkApi.dispatch(setNowAiLoading(true));
        thunkApi.dispatch(setNowQuery(payload.query));

        const headers = createRequestHeader();

        const filtersByCategory: Record<string, string[]> = payload.filters.reduce(
          (acc, filter) => {
            acc[filter.category] = acc[filter.category] || [];
            acc[filter.category].push(filter.value);
            return acc;
          },
          {} as Record<string, string[]>
        );

        const searchQuery: SearchQuery = {
          query: payload.query,
          filters:
            payload.filters.length > 0
              ? {
                  operator: FilterOperator.AND,
                  conditions: Object.entries(filtersByCategory).map(([category, values]) => ({
                    field: category,
                    operator: ConditionOperator.IN,
                    value: values,
                  })),
                }
              : undefined,
        };

        const state = thunkApi.getState() as RootState;
        const currentFilters = state.nowApplicationSearch.filters;

        let eventSource = null;

        try {
          eventSource = createEventSource({
            url: `${ENVIRONMENT.apiUrl}${API.NOW_APPLICATION_DOCUMENT_SEARCH(payload.nowApplicationGuid)}`,
            body: JSON.stringify(searchQuery),
            fetch: fetch,
            method: "POST",
            headers: {
              ...headers.headers,
              Accept: "text/event-stream",
              "Content-Type": "application/json",
            },

            onMessage: ({ event, data }) => {
              const eventPayload = JSON.parse(data);
              const updatedState: RootState = thunkApi.getState();

              switch (event) {
                case SearchEventType.AI_START:
                  thunkApi.dispatch(setNowAiLoading(true));
                  break;
                case SearchEventType.DOCUMENTS:
                  thunkApi.dispatch(updateNowSearchResults(eventPayload));
                  thunkApi.dispatch(setNowDocumentLoading(false));
                  if (
                    updatedState.nowApplicationSearch.filters.length === 0 &&
                    currentFilters.length > 0
                  ) {
                    thunkApi.dispatch(setNowFilters(currentFilters));
                  }
                  break;
                case SearchEventType.PROMPT:
                  thunkApi.dispatch(updateNowPromptResults(eventPayload));
                  break;
                case SearchEventType.AI_COMPLETE:
                  thunkApi.dispatch(setNowAiLoading(false));
                  break;
                case SearchEventType.ERROR:
                  thunkApi.dispatch(
                    updateNowPromptResults({ answers: [eventPayload.message] })
                  );
                  thunkApi.dispatch(setNowDocumentLoading(false));
                  thunkApi.dispatch(setNowAiLoading(false));
                  break;
              }
            },

            onDisconnect: () => {
              eventSource.close();
              thunkApi.dispatch(hideLoading());
            },
          });

          return null;
        } catch (error) {
          console.error("NoW document search error:", error);
          thunkApi.dispatch(hideLoading());
          thunkApi.dispatch(setNowDocumentLoading(false));
          thunkApi.dispatch(setNowAiLoading(false));
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
    selectNowSearchQuery: (state: NowApplicationSearchState): string => state.query,
    selectNowSearchFilters: (
      state: NowApplicationSearchState
    ): NowApplicationSearchFilters => state.filters,
    selectNowSearchResults: (state: NowApplicationSearchState): SearchResult | null =>
      state.results,
    selectNowSearchLoading: (state: NowApplicationSearchState): boolean => state.loading,
    selectNowDocumentLoading: (state: NowApplicationSearchState): boolean =>
      state.documentLoading,
    selectNowAiLoading: (state: NowApplicationSearchState): boolean => state.aiLoading,
    selectNowAllFacets: (
      state: NowApplicationSearchState
    ): { [key: string]: Facet[] } => state.allFacets,
  },
});

export const {
  searchNowApplicationDocuments,
  setNowQuery,
  setNowFilters,
  updateNowSearchResults,
  updateNowPromptResults,
  setNowAiLoading,
  setNowDocumentLoading,
} = nowApplicationSearchSlice.actions;

export const {
  selectNowSearchQuery,
  selectNowSearchFilters,
  selectNowSearchResults,
  selectNowSearchLoading,
  selectNowDocumentLoading,
  selectNowAiLoading,
  selectNowAllFacets,
} = nowApplicationSearchSlice.selectors;

export default nowApplicationSearchSlice.reducer;
