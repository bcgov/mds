import { hideLoading, showLoading } from "react-redux-loading-bar";
import moment from "moment-timezone";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import { IComplianceArticle, ItemMap } from "@mds/common/interfaces";
import { formatComplianceCodeArticleNumber } from "@mds/common/redux/utils/helpers";
import { REPORT_REGULATORY_AUTHORITY_CODES } from "@mds/common/constants/enums";
import { createSelector } from "@reduxjs/toolkit";

export const complianceCodeReducerType = "complianceCodes";
export const itemPrefix = "code";
interface ComplianceCodeState {
  complianceCodeMap: ItemMap<IComplianceArticle>;
}
const initialState: ComplianceCodeState = {
  complianceCodeMap: null,
};

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

// could probably make this generic
// the stack doesn't print nicely with action.error, action.error.stack outputs the \n properly
const rejectHandler = (action) => {
  console.log(action.error);
  console.log(action.error.stack);
};

// creates 'articleNumber' property and fills in cim_or_cpo where blank
const formatCode = (code: IComplianceArticle): IComplianceArticle => {
  const cim_or_cpo = code.cim_or_cpo ?? REPORT_REGULATORY_AUTHORITY_CODES.NONE;
  const is_expired = !moment(code.expiry_date).isAfter();
  const articleNumber = formatComplianceCodeArticleNumber(code);
  return { ...code, articleNumber, cim_or_cpo, is_expired };
};

const complianceCodeSlice = createAppSlice({
  name: complianceCodeReducerType,
  initialState: initialState,
  reducers: (create) => ({
    fetchComplianceCodes: create.asyncThunk(
      async (searchParams = {}, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const resp = await CustomAxios({
          errorToastMessage: "Failed to load compliance codes",
        }).get(`${ENVIRONMENT.apiUrl}${API.COMPLIANCE_CODE_LIST(searchParams)}`, headers);
        thunkApi.dispatch(hideLoading());
        return resp.data;
      },
      {
        fulfilled: (state: ComplianceCodeState, action) => {
          const itemMap = action.payload.records.reduce((acc, code) => {
            acc[`code${code.compliance_article_id}`] = formatCode(code);
            return acc;
          }, {});
          state.complianceCodeMap = itemMap;
        },
        rejected: (_state: ComplianceCodeState, action) => {
          rejectHandler(action);
        },
      }
    ),
    createComplianceCode: create.asyncThunk(
      async (payload: IComplianceArticle, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const messages = {
          errorToastMessge: "default",
          successToastMessage: "Successfully created new compliance code article",
        };
        const resp = await CustomAxios(messages).post(
          `${ENVIRONMENT.apiUrl}${API.COMPLIANCE_CODE_ADD()}`,
          payload,
          headers
        );
        thunkApi.dispatch(hideLoading());
        return resp.data;
      },
      {
        fulfilled: (state: ComplianceCodeState, action) => {
          state.complianceCodeMap[`code${action.payload.compliance_article_id}`] = formatCode(
            action.payload
          );
        },
        rejected: (_state: ComplianceCodeState, action) => {
          rejectHandler(action);
        },
      }
    ),
    updateComplianceCodes: create.asyncThunk(
      async (payload: IComplianceArticle[], thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const messages = {
          errorToastMessage: "default",
          successToastMessage: "Successfully updated compliance codes",
        };
        const resp = await CustomAxios(messages).put(
          `${ENVIRONMENT.apiUrl}${API.COMPLIANCE_CODE_BULK_UPDATE()}`,
          { compliance_article_codes: payload },
          headers
        );
        thunkApi.dispatch(hideLoading());
        return resp.data;
      },
      {
        fulfilled: (state: ComplianceCodeState, action) => {
          action.payload.forEach((code) => {
            state.complianceCodeMap[`code${code.compliance_article_id}`] = formatCode(code);
          });
        },
      }
    ),
  }),
  selectors: {
    getFormattedComplianceCodes: (state): ItemMap<IComplianceArticle> => {
      return state.complianceCodeMap;
    },
  },
});

export const {
  fetchComplianceCodes,
  createComplianceCode,
  updateComplianceCodes,
} = complianceCodeSlice.actions;
export const { getFormattedComplianceCodes } = complianceCodeSlice.selectors;
// derived data needs to be in createSelector outside of the reducer definition,
// to prevent 'maximum update depth exceeded' and have input selector be in scope
export const getActiveComplianceCodesList = createSelector(
  [getFormattedComplianceCodes],
  (codes) => {
    return Object.values(codes).filter((code) => !code.is_expired);
  }
);

const complianceCodeReducer = complianceCodeSlice.reducer;
export default complianceCodeReducer;
