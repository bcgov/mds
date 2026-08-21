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
import CustomAxios from "@mds/common/redux/customAxios";

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

export type NowIndexerStatusValue = "never_run" | "running" | "success" | "error" | "transientFailure";

export interface NowIndexerStatus {
  status: NowIndexerStatusValue;
  items_processed: number;
  document_count?: number;
  error_count: number;
  last_run_start: string | null;
  last_run_end: string | null;
  error_message: string | null;
  percent?: number;
  stage?: string;
}

interface NowApplicationSearchState {
  results: SearchResult | null;
  loading: boolean;
  documentLoading: boolean;
  aiLoading: boolean;
  indexing: boolean;
  cancelling: boolean;
  indexerStatus: NowIndexerStatus | null;
  indexerStatusLoading: boolean;
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
  indexing: false,
  cancelling: false,
  indexerStatus: null,
  indexerStatusLoading: false,
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
        } else {
          state.results = {
            documents: [],
            prompt: action.payload,
          };
        }
      }
    ),
    setNowAiLoading: create.reducer((state, action: { payload: boolean }) => {
      state.aiLoading = action.payload;
    }),
    setNowDocumentLoading: create.reducer((state, action: { payload: boolean }) => {
      state.documentLoading = action.payload;
    }),
    clearNowSearch: create.reducer((state, action: { payload: string }) => {
      if (state.nowApplicationGuid === action.payload) {
        return;
      }
      state.results = null;
      state.query = "";
      state.filters = [];
      state.allFacets = {};
      state.nowApplicationGuid = action.payload;
    }),

    /**
     * Triggers document indexing for a NoW application via the core-api proxy.
     * Downloads all application documents from Document Manager and indexes them
     * in Azure AI Search via the permits service. Safe to re-run — existing records
     * are overwritten by deterministic chunk IDs.
     */
    indexNowApplicationDocuments: create.asyncThunk(
      async (nowApplicationGuid: string, thunkApi) => {
        thunkApi.dispatch(showLoading());
        const headers = createRequestHeader();
        await CustomAxios({ errorToastMessage: "Failed to index documents" }).post(
          `${ENVIRONMENT.apiUrl}${API.NOW_APPLICATION_DOCUMENT_INDEX(nowApplicationGuid)}`,
          {},
          headers
        );
        thunkApi.dispatch(hideLoading());
      },
      {
        pending: (state) => {
          state.indexing = true;
        },
        fulfilled: (state) => {
          state.indexing = false;
        },
        rejected: (state) => {
          state.indexing = false;
        },
      }
    ),

    /**
     * Cancels the active Celery indexing task for a NoW application.
     * Revokes the task server-side and clears the Redis tracking key so the
     * status badge returns to its last known state on the next poll.
     */
    cancelNowIndexing: create.asyncThunk(
      async (nowApplicationGuid: string, thunkApi) => {
        const headers = createRequestHeader();
        await CustomAxios({ errorToastMessage: "Failed to cancel indexing" }).delete(
          `${ENVIRONMENT.apiUrl}${API.NOW_APPLICATION_DOCUMENT_INDEX(nowApplicationGuid)}`,
          headers
        );
        // Re-fetch status immediately so the badge updates without waiting for the next poll.
        thunkApi.dispatch(fetchNowIndexingStatus(nowApplicationGuid));
      },
      {
        pending: (state) => {
          state.cancelling = true;
        },
        fulfilled: (state) => {
          state.cancelling = false;
        },
        rejected: (state) => {
          state.cancelling = false;
        },
      }
    ),

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
    fetchNowIndexingStatus: create.asyncThunk(
      async (nowApplicationGuid: string, thunkApi) => {
        const headers = createRequestHeader();
        const response = await CustomAxios({ errorToastMessage: "Failed to fetch indexing status" }).get(
          `${ENVIRONMENT.apiUrl}${API.NOW_APPLICATION_DOCUMENT_INDEX_STATUS(nowApplicationGuid)}`,
          headers
        );
        return response.data as NowIndexerStatus;
      },
      {
        pending: (state) => {
          state.indexerStatusLoading = true;
        },
        fulfilled: (state, action) => {
          state.indexerStatusLoading = false;
          state.indexerStatus = action.payload;
        },
        rejected: (state) => {
          state.indexerStatusLoading = false;
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
    selectNowIndexing: (state: NowApplicationSearchState): boolean => state.indexing,
    selectNowCancelling: (state: NowApplicationSearchState): boolean => state.cancelling,
    selectNowAllFacets: (
      state: NowApplicationSearchState
    ): { [key: string]: Facet[] } => state.allFacets,
    selectNowIndexerStatus: (state: NowApplicationSearchState): NowIndexerStatus | null =>
      state.indexerStatus,
    selectNowIndexerStatusLoading: (state: NowApplicationSearchState): boolean =>
      state.indexerStatusLoading,
  },
});

export const {
  searchNowApplicationDocuments,
  indexNowApplicationDocuments,
  cancelNowIndexing,
  fetchNowIndexingStatus,
  setNowQuery,
  setNowFilters,
  updateNowSearchResults,
  updateNowPromptResults,
  setNowAiLoading,
  setNowDocumentLoading,
  clearNowSearch,
} = nowApplicationSearchSlice.actions;

export const {
  selectNowSearchQuery,
  selectNowSearchFilters,
  selectNowSearchResults,
  selectNowSearchLoading,
  selectNowDocumentLoading,
  selectNowAiLoading,
  selectNowIndexing,
  selectNowCancelling,
  selectNowAllFacets,
  selectNowIndexerStatus,
  selectNowIndexerStatusLoading,
} = nowApplicationSearchSlice.selectors;

export default nowApplicationSearchSlice.reducer;
