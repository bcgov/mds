import CustomAxios from "../customAxios";
import { MINE } from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { IPermitConditionComparison } from "@mds/common/interfaces/permits";

interface IPermitConditionDiffState {
    diffs: { [key: string]: IPermitConditionComparison };
    isLoading: boolean;
}

const initialState: IPermitConditionDiffState = {
    diffs: {},
    isLoading: false
};

const permitConditionDiffReducerType = "permitConditionDiff";

const permitConditionDiffSlice = createAppSlice({
    name: permitConditionDiffReducerType,
    initialState,
    reducers: (create) => ({
        fetchPermitConditionDiff: create.asyncThunk(
            async (params: { mineGuid: string; permitGuid: string; amendmentGuid: string }, thunkApi) => {
                const { mineGuid, permitGuid, amendmentGuid } = params;
                const headers = createRequestHeader();
                const response = await CustomAxios().get(
                    `${ENVIRONMENT.apiUrl}${MINE}/${mineGuid}/permits/${permitGuid}/amendments/${amendmentGuid}/diff`,
                    headers
                );

                return {
                    key: amendmentGuid,
                    data: response.data.comparison
                };
            },
            {
                fulfilled: (state: IPermitConditionDiffState, action) => {
                    state.diffs[action.payload.key] = action.payload.data;
                },
                rejected: (state: IPermitConditionDiffState, action) => {
                    rejectHandler(action);
                },
            }
        )
    }),
    selectors: {
        getPermitConditionDiff: (state, amendmentGuid: string) =>
            state.diffs[amendmentGuid],
    }
});

export { permitConditionDiffReducerType };
export const { getPermitConditionDiff } = permitConditionDiffSlice.selectors;
export const { fetchPermitConditionDiff } = permitConditionDiffSlice.actions;
export default permitConditionDiffSlice.reducer;
