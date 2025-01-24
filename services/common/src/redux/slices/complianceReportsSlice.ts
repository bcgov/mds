import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import { IMineReportDefinition, ItemMap } from "@mds/common/interfaces";
import { createItemMap } from "@mds/common/redux/utils/helpers";


export const complianceReportReducerType = 'complianceReports'

interface ComplianceReportState {
    complianceReportMap: ItemMap<IMineReportDefinition>;
};

const initialState: ComplianceReportState = {
    complianceReportMap: null,
};

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

const complianceReportSlice = createAppSlice({
    name: complianceReportReducerType,
    initialState,
    reducers: (create) => ({
        fetchComplianceReports: create.asyncThunk(
            async (searchParams = {}, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());
                const resp = await CustomAxios({
                    errorToastMessage: "Failed to load compliance reports",
                }).get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT_DEFINITIONS(searchParams)}`, headers);
                thunkApi.dispatch(hideLoading());
                return resp.data;
            },
            {
                fulfilled: (state: ComplianceReportState, action) => {
                    const records: IMineReportDefinition[] = action.payload.records ?? [];
                    const itemMap = createItemMap(records, "mine_report_definition_guid")
                    state.complianceReportMap = itemMap;
                },
                rejected: (_state: ComplianceReportState, action) => {
                    rejectHandler(action);
                }
            }
        )
    }),
    selectors: {
        getComplianceReports: (state): ItemMap<IMineReportDefinition> => {
            return state.complianceReportMap;
        }
    }
});

export const {
    fetchComplianceReports
} = complianceReportSlice.actions;
export const { getComplianceReports } = complianceReportSlice.selectors;

const complianceReportReducer = complianceReportSlice.reducer;
export default complianceReportReducer;