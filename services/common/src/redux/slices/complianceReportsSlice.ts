import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import { IMineReportDefinition, IPageData, ItemMap } from "@mds/common/interfaces";
import { createDropDownList, createItemMap, formatComplianceCodeReportName } from "@mds/common/redux/utils/helpers";
import { createSelectorWrapper } from "../selectors/staticContentSelectors";
import { createSelector } from "@reduxjs/toolkit";
import { ISearchParams } from "@mds/common/interfaces/common/searchParams.interface";


export const complianceReportReducerType = 'complianceReports'

export interface ComplianceReportParams extends ISearchParams {
    is_prr_only?: boolean[];
    regulatory_authority?: "CPO" | "CIM" | "Both" | "NONE"[];
    active_ind?: boolean[];
};

export const reportParamsGetAll: ComplianceReportParams = {
    per_page: 0,
    active_ind: [true, false]
};

interface ComplianceReportState {
    reportPageData: IPageData<IMineReportDefinition>,
    params: ComplianceReportParams;
};

const initialState: ComplianceReportState = {
    reportPageData: {
        records: [],
        current_page: 0,
        items_per_page: 0,
        total: 0,
        total_pages: 0
    },
    params: {}
};

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

const complianceReportSlice = createAppSlice({
    name: complianceReportReducerType,
    initialState,
    reducers: (create) => ({
        fetchComplianceReports: create.asyncThunk(
            async (searchParams: ComplianceReportParams, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());
                const resp = await CustomAxios({
                    errorToastMessage: "Failed to load compliance reports",
                }).get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT_DEFINITIONS(searchParams ?? {})}`, headers);
                thunkApi.dispatch(hideLoading());
                return resp.data;
            },
            {
                fulfilled: (state: ComplianceReportState, action) => {
                    const records: IMineReportDefinition[] = action.payload.records ?? [];
                    const { current_page, items_per_page, total, total_pages } = action.payload;
                    state.reportPageData = { records, current_page, items_per_page, total, total_pages };
                    state.params = action.meta.arg;
                },
                rejected: (_state: ComplianceReportState, action) => {
                    rejectHandler(action);
                }
            }
        )
    }),
    selectors: {
        getMineReportDefinitionHash: (state): ItemMap<IMineReportDefinition> => {
            return createItemMap(state.reportPageData.records, "mine_report_definition_guid")
        },
        getMineReportDefinitionOptions: (state): IMineReportDefinition[] => {
            return state.reportPageData.records;
        },
        getComplianceReportPageData: (state): IPageData<IMineReportDefinition> => {
            return state.reportPageData;
        },
        getReportSearchParams: (state): ComplianceReportParams => {
            return state.params;
        },
    }
});

export const { getMineReportDefinitionHash, getMineReportDefinitionOptions, getComplianceReportPageData, getReportSearchParams
} = complianceReportSlice.selectors;

export const getDropdownMineReportDefinitionOptions = createSelectorWrapper(
    getMineReportDefinitionOptions,
    createDropDownList, ["report_name", "mine_report_definition_guid", "active_ind"]
);

export const getFormattedMineReportDefinitionOptions = createSelectorWrapper(
    getMineReportDefinitionOptions,
    (options: IMineReportDefinition[]) => {
        return options
            .map((item) => {
                return {
                    label: formatComplianceCodeReportName(item),
                    value: item.mine_report_definition_guid,
                    isActive: item.active_ind,
                    is_common: item.is_common,
                    report_name: item.report_name,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }
);

export const getMineReportDefinitionByGuid = (mineReportDefinitionGuid: string) =>
    createSelector([getMineReportDefinitionHash], (reportMap) => {
        return reportMap[mineReportDefinitionGuid]
    });

export const getReportDefinitionsLoaded = (params: ComplianceReportParams) =>
    createSelector([getReportSearchParams], (currentParams) => {
        return params === currentParams;
    })

export const {
    fetchComplianceReports
} = complianceReportSlice.actions;


const complianceReportReducer = complianceReportSlice.reducer;
export default complianceReportReducer;