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
    query: string;
    filters: PermitSearchFilters;
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
        setFilters: create.reducer((state, action: { payload: PermitSearchFilters }) => {
            state.filters = action.payload;
        }),
        searchPermitConditions: create.asyncThunk(
            async (payload: { query: string, filters: PermitSearchFilters }, thunkApi) => {
                thunkApi.dispatch(showLoading());

                thunkApi.dispatch(setQuery(payload.query));
                thunkApi.dispatch(setFilters(payload.filters));

                const headers = createRequestHeader();

                const filtersByCategory: Record<string, string[]> = payload.filters.reduce((acc, filter) => {
                    acc[filter.category] = acc[filter.category] || [];
                    acc[filter.category].push(filter.value);
                    return acc;
                }, {} as Record<string, string[]>);

                thunkApi.dispatch(setFilters(payload.filters));

                // Convert filters selected into a format understood by Azure AI Search.
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
