import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT, REGIONS_LIST } from "@mds/common/constants";
import { RootState } from "@mds/common/redux/rootState";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

const rejectHandler = (action) => {
  console.log(action.error);
  console.log(action.error.stack);
};

interface Region {
  name: string;
  regional_district_id: number;
}

interface RegionsState {
  regions: Region[];
}

const initialState: RegionsState = {
  regions: [],
};

const regionsSlice = createAppSlice({
  name: "regionsSlice",
  initialState,
  reducers: (create) => ({
    fetchRegions: create.asyncThunk(
      async (_, thunkAPI) => {
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${REGIONS_LIST}`, headers);

        thunkAPI.dispatch(hideLoading());

        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.regions = action.payload;
        },
        rejected: (state: RegionsState, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
  selectors: {
    getRegionOptions: (state: RegionsState) => {
      return state.regions.map((region) => ({
        label: region.name,
        value: region.regional_district_id,
      }));
    },
  },
});

export const { fetchRegions } = regionsSlice.actions;
export const { getRegionOptions } = regionsSlice.getSelectors(
  (rootState: RootState) => rootState.regions
);

const regionsReducer = regionsSlice.reducer;
export default regionsReducer;
