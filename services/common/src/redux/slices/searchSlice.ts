import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import { ISearchResult, ISearchResultList, ISimpleSearchResult } from "@mds/common/interfaces";

export const searchReducerType = "search";

// Helper function for deep cloning that works in all environments
const deepClone = <T>(obj: T): T => {
    // Try structuredClone if available (modern browsers/Node 17+)
    if (typeof structuredClone !== 'undefined') {
        return structuredClone(obj);
    }
    // Fallback to JSON parse/stringify for test environments
    // This works fine for Redux state which should be serializable
    return JSON.parse(JSON.stringify(obj));
};

export interface SearchState {
    searchOptions: any[];
    searchResults: ISearchResultList;
    searchFacets: any;
    searchBarResults: ISearchResult<ISimpleSearchResult>[];
    searchBarFacets: { mine: number; person: number; organization: number; permit: number; nod: number; explosives_permit: number; now_application: number; mine_documents: number; permit_documents: number };
    searchTerms: any[];
    searchSubsetResults: any[];
}

const initialState: SearchState = {
    searchOptions: [],
    searchResults: {
        mine: [],
        mine_documents: [],
        party: [],
        permit: [],
        notice_of_departure: [],
        explosives_permit: [],
        now_application: [],
        permit_documents: [],
    },
    searchFacets: {
        mine_region: [], mine_classification: [], mine_operation_status: [], mine_tenure: [], mine_commodity: [], has_tsf: [], verified_status: [], permit_status: [], is_exploration: [], party_type: [], explosives_permit_status: [], explosives_permit_closed: [], nod_type: [], nod_status: [], now_application_status: [], now_type: [], type: []
    },
    searchBarResults: [],
    searchBarFacets: { mine: 0, person: 0, organization: 0, permit: 0, nod: 0, explosives_permit: 0, now_application: 0, mine_documents: 0, permit_documents: 0 },
    searchTerms: [],
    searchSubsetResults: [],
};

const searchSlice = createAppSlice({
    name: searchReducerType,
    initialState,
    reducers: (create) => ({
        storeSearchOptions: create.reducer((state, action: { payload: any[] }) => {
            state.searchOptions = action.payload;
        }),
        storeSearchResults: create.reducer((state, action: { payload: { search_results: ISearchResultList; facets: any; search_terms: any[] } }) => {
            state.searchResults = action.payload.search_results;
            state.searchFacets = action.payload.facets ? deepClone(action.payload.facets) : initialState.searchFacets;
            state.searchTerms = action.payload.search_terms;
        }),
        storeSubsetSearchResults: create.reducer((state, action: { payload: any[] }) => {
            state.searchSubsetResults = action.payload;
        }),
        storeSearchBarResults: create.reducer((state, action: { payload: { search_results: ISearchResult<ISimpleSearchResult>[]; facets: any } }) => {
            state.searchBarResults = action.payload.search_results;
            state.searchBarFacets = action.payload.facets ? deepClone(action.payload.facets) : initialState.searchBarFacets;
        }),
        clearSearchBarResults: create.reducer((state) => {
            state.searchBarResults = [];
            state.searchBarFacets = initialState.searchBarFacets;
        }),
        clearAllSearchResults: create.reducer(() => {
            return initialState;
        }),
        fetchSearchResults: create.asyncThunk(
            async ({ searchTerm, searchTypes, filters = {} }: { searchTerm: string; searchTypes: string[]; filters?: any }, thunkApi) => {
                thunkApi.dispatch(showLoading());

                const params: any = {
                    search_term: searchTerm,
                    search_types: searchTypes,
                    ...filters
                };

                // Remove undefined/null/empty values
                Object.keys(params).forEach(key => {
                    if (params[key] === undefined || params[key] === null || params[key] === '') {
                        delete params[key];
                    }
                });

                const headers = createRequestHeader();
                const response = await CustomAxios().get(
                    `${ENVIRONMENT.apiUrl}${API.SEARCH(params)}`,
                    headers
                );

                thunkApi.dispatch(hideLoading());
                return response.data;
            },
            {
                fulfilled: (state, action) => {
                    // If search_results is an empty array, use initial state structure
                    const results = action.payload.search_results;
                    state.searchResults = (Array.isArray(results) && results.length === 0)
                        ? initialState.searchResults
                        : results;
                    state.searchFacets = action.payload.facets ? deepClone(action.payload.facets) : initialState.searchFacets;
                    state.searchTerms = action.payload.search_terms;
                },
                rejected: (state, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchSearchBarResults: create.asyncThunk(
            async ({ searchTerm, searchTypes = null, mineGuid = null }: { searchTerm: string; searchTypes?: string[] | null; mineGuid?: string | null }, thunkApi) => {
                thunkApi.dispatch(showLoading());

                let url = `${ENVIRONMENT.apiUrl}${API.SIMPLE_SEARCH}?search_term=${encodeURIComponent(searchTerm)}`;
                if (searchTypes && searchTypes.length > 0) {
                    url += `&search_types=${encodeURIComponent(searchTypes.join(','))}`;
                }
                if (mineGuid) {
                    url += `&mine_guid=${encodeURIComponent(mineGuid)}`;
                }

                const headers = createRequestHeader();
                const response = await CustomAxios().get(url, headers);

                thunkApi.dispatch(hideLoading());
                return response.data;
            },
            {
                fulfilled: (state, action) => {
                    state.searchBarResults = action.payload.search_results;
                    state.searchBarFacets = action.payload.facets ? deepClone(action.payload.facets) : initialState.searchBarFacets;
                },
                rejected: (state, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchSearchOptions: create.asyncThunk(
            async (_, thunkApi) => {
                thunkApi.dispatch(showLoading());

                const headers = createRequestHeader();
                const response = await CustomAxios().get(
                    `${ENVIRONMENT.apiUrl}${API.SEARCH_OPTIONS}`,
                    headers
                );

                thunkApi.dispatch(hideLoading());
                return response.data;
            },
            {
                fulfilled: (state, action) => {
                    state.searchOptions = action.payload;
                },
                rejected: (state, action) => {
                    rejectHandler(action);
                },
            }
        ),
    }),
    selectors: {
        selectSearchOptions: (state: SearchState) => state.searchOptions,
        selectSearchResults: (state: SearchState) => state.searchResults,
        selectSearchFacets: (state: SearchState) => state.searchFacets,
        selectSearchBarResults: (state: SearchState) => state.searchBarResults,
        selectSearchBarFacets: (state: SearchState) => state.searchBarFacets,
        selectSearchTerms: (state: SearchState) => state.searchTerms,
        selectSearchSubsetResults: (state: SearchState) => state.searchSubsetResults,
    },
});

export const {
    storeSearchOptions,
    storeSearchResults,
    storeSubsetSearchResults,
    storeSearchBarResults,
    clearSearchBarResults,
    clearAllSearchResults,
    fetchSearchResults,
    fetchSearchBarResults,
    fetchSearchOptions,
} = searchSlice.actions;

export const {
    selectSearchOptions,
    selectSearchResults,
    selectSearchFacets,
    selectSearchBarResults,
    selectSearchBarFacets,
    selectSearchTerms,
    selectSearchSubsetResults,
} = searchSlice.selectors;

// Legacy selector exports for backward compatibility
export const getSearchOptions = (state: { search: SearchState }) => state.search.searchOptions;
export const getSearchResults = (state: { search: SearchState }) => state.search.searchResults;
export const getSearchFacets = (state: { search: SearchState }) => state.search.searchFacets;
export const getSearchBarResults = (state: { search: SearchState }) => state.search.searchBarResults;
export const getSearchBarFacets = (state: { search: SearchState }) => state.search.searchBarFacets;
export const getSearchTerms = (state: { search: SearchState }) => state.search.searchTerms;
export const getSearchSubsetResults = (state: { search: SearchState }) => state.search.searchSubsetResults;

export default searchSlice.reducer;
