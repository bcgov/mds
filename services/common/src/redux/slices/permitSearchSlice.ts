import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { RootState } from "../rootState";
import { createRequestHeader } from "../utils/RequestHeaders";
import { Facet, SearchQuery, SearchResult } from "@mds/common/interfaces/search/facet-search.interface";

export const permitSearchReducerType = "permitSearch";

interface PermitSearchState {
    results: SearchResult | null;
    loading: boolean;
    query: string;
    filters: Array<{ category: string; value: string }>;
    allFacets: { [key: string]: Facet[] };
}

const initialState: PermitSearchState = {
    results: null,
    loading: false,
    query: '',
    filters: [],
    allFacets: {},
};

const permitSearchSlice = createAppSlice({
    name: permitSearchReducerType,
    initialState,
    reducers: (create) => ({
        setQuery: create.reducer((state, action: { payload: string }) => {
            state.query = action.payload;
        }),
        setFilters: create.reducer((state, action: { payload: Array<{ category: string; value: string }> }) => {
            state.filters = action.payload;
        }),
        searchPermitConditions: create.asyncThunk(
            async (payload: SearchQuery, thunkApi) => {
                thunkApi.dispatch(showLoading());
                const headers = createRequestHeader();

                try {
                    const response = await CustomAxios().post(
                        `${ENVIRONMENT.apiUrl}/search/permit-conditions`,
                        payload,
                        headers
                    );

                    thunkApi.dispatch(hideLoading());
                    return response.data;
                } catch (error) {
                    thunkApi.dispatch(hideLoading());
                    throw error;
                }
            },
            {
                pending: (state) => {
                    state.loading = true;
                },
                fulfilled: (state, action) => {
                    state.loading = false;
                    state.results = action.payload;

                    // Merge new facets with existing ones
                    const currentFacets = action.payload.facets || {};

                    state.allFacets = {
                        ...state.allFacets,
                        ...Object.fromEntries(
                            Object.entries(currentFacets).map(([key, values]) => [
                                key,
                                Array.from(
                                    new Map([
                                        ...(state.allFacets[key] || []),
                                        ...(values as Facet[])
                                    ].map(item => [item.value, item])).values()
                                )
                            ])
                        )
                    };

                    // Also update the results allFacets
                    state.results.allFacets = state.allFacets;
                },
                rejected: (state) => {
                    state.loading = false;
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
    },
});

export const { searchPermitConditions, setQuery, setFilters } = permitSearchSlice.actions;
export const {
    selectSearchQuery,
    selectSearchFilters,
    selectSearchResults,
    selectSearchLoading,
    selectAllFacets,
} = permitSearchSlice.selectors;

export default permitSearchSlice.reducer;
