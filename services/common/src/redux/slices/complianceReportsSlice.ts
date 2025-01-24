import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import { IMineReportDefinition, IPageData, ItemMap } from "@mds/common/interfaces";
import { createItemMap } from "@mds/common/redux/utils/helpers";


export const complianceReportReducerType = 'complianceReports'

interface ComplianceReportState {
    complianceReportMap: ItemMap<IMineReportDefinition>;
    reportPageData: IPageData<IMineReportDefinition>,
};

const initialState: ComplianceReportState = {
    complianceReportMap: null,
    reportPageData: {
        records: [],
        current_page: 0,
        items_per_page: 0,
        total: 0,
        total_pages: 0
    }
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
                console.log(resp);
                return resp.data;
            },
            {
                fulfilled: (state: ComplianceReportState, action) => {
                    const records: IMineReportDefinition[] = action.payload.records ?? [];
                    const { current_page, items_per_page, total, total_pages } = action.payload;
                    const itemMap = createItemMap(records, "mine_report_definition_guid")
                    state.complianceReportMap = itemMap;
                    state.reportPageData = { records, current_page, items_per_page, total, total_pages };
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
        },
        getComplianceReportsAsList: (state): IMineReportDefinition[] => {
            return Object.values(state.complianceReportMap);
        },
        getComplianceReportPageData: (state): IPageData<IMineReportDefinition> => {
            return state.reportPageData;
        }
    }
});

export const {
    fetchComplianceReports
} = complianceReportSlice.actions;
export const { getComplianceReports, getComplianceReportsAsList, getComplianceReportPageData } = complianceReportSlice.selectors;

const complianceReportReducer = complianceReportSlice.reducer;
export default complianceReportReducer;