import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as staticContentActions from "@/actions/staticContentActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";
import {
  getMineStatusOptions,
  getMineRegionOptions,
  getMineTenureTypeOptions,
  getMineCommodityOptions,
  getMineDisturbanceOptions,
  getProvinceOptions,
  getPermitStatusOptions,
  getComplianceCodes,
  getIncidentDocumentTypeOptions,
  getIncidentFollowupActionOptions,
  getIncidentDeterminationOptions,
  getIncidentStatusCodeOptions,
  getIncidentCategoryCodeOptions,
  getVarianceStatusOptions,
  getVarianceDocumentCategoryOptions,
} from "@/selectors/staticContentSelectors";

export const fetchMineDisturbanceOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_DISTURBANCE_OPTIONS));
  return CustomAxios({ selector: getMineDisturbanceOptions })
    .get(ENVIRONMENT.apiUrl + API.DISTURBANCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_DISTURBANCE_OPTIONS));
      dispatch(staticContentActions.storeDisturbanceOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_DISTURBANCE_OPTIONS)));
};

export const fetchMineCommodityOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_COMMODITY_OPTIONS));
  return CustomAxios({ selector: getMineCommodityOptions })
    .get(ENVIRONMENT.apiUrl + API.COMMODITY_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_COMMODITY_OPTIONS));
      dispatch(staticContentActions.storeCommodityOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_COMMODITY_OPTIONS)));
};

export const fetchStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_STATUS_OPTIONS));
  return CustomAxios({ selector: getMineStatusOptions })
    .get(ENVIRONMENT.apiUrl + API.MINE_STATUS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_STATUS_OPTIONS));
      dispatch(staticContentActions.storeStatusOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_STATUS_OPTIONS)));
};

export const fetchRegionOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_REGION_OPTIONS));
  return CustomAxios({ selector: getMineRegionOptions })
    .get(ENVIRONMENT.apiUrl + API.MINE_REGION, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_REGION_OPTIONS));
      dispatch(staticContentActions.storeRegionOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_REGION_OPTIONS)));
};

export const fetchMineTenureTypes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_TENURE_TYPES));
  return CustomAxios({ errorToastMessage: String.ERROR, selector: getMineTenureTypeOptions })
    .get(ENVIRONMENT.apiUrl + API.MINE_TENURE_TYPES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_TENURE_TYPES));
      dispatch(staticContentActions.storeTenureTypes(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_TENURE_TYPES)));
};

export const fetchPermitStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMIT_STATUS_OPTIONS));
  return CustomAxios({ selector: getPermitStatusOptions })
    .get(`${ENVIRONMENT.apiUrl}${API.PERMITSTATUSCODES()}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMIT_STATUS_OPTIONS));
      dispatch(staticContentActions.storePermitStatusOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PERMIT_STATUS_OPTIONS)));
};

export const fetchIncidentDocumentTypeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_INCIDENT_DOCUMENT_TYPE_OPTIONS));
  return CustomAxios({ selector: getIncidentDocumentTypeOptions })
    .get(ENVIRONMENT.apiUrl + API.INCIDENT_DOCUMENT_TYPE, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_INCIDENT_DOCUMENT_TYPE_OPTIONS));
      dispatch(staticContentActions.storeIncidentDocumentTypeOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_INCIDENT_DOCUMENT_TYPE_OPTIONS)));
};

export const fetchMineIncidentFollowActionOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_INCIDENT_FOLLOWUP_ACTION_OPTIONS));
  return CustomAxios({ selector: getIncidentFollowupActionOptions })
    .get(ENVIRONMENT.apiUrl + API.INCIDENT_FOLLOWUP_ACTIONS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_INCIDENT_FOLLOWUP_ACTION_OPTIONS));
      dispatch(staticContentActions.storeMineIncidentFollowActionOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_INCIDENT_FOLLOWUP_ACTION_OPTIONS)));
};

export const fetchMineIncidentDeterminationOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_INCIDENT_DETERMINATION_OPTIONS));
  return CustomAxios({ selector: getIncidentDeterminationOptions })
    .get(ENVIRONMENT.apiUrl + API.INCIDENT_DETERMINATION_TYPES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_INCIDENT_DETERMINATION_OPTIONS));
      dispatch(staticContentActions.storeMineIncidentDeterminationOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_INCIDENT_DETERMINATION_OPTIONS)));
};

export const fetchMineIncidentStatusCodeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_INCIDENT_STATUS_CODE_OPTIONS));
  return CustomAxios({ selector: getIncidentStatusCodeOptions })
    .get(ENVIRONMENT.apiUrl + API.INCIDENT_STATUS_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_INCIDENT_STATUS_CODE_OPTIONS));
      dispatch(staticContentActions.storeMineIncidentStatusCodeOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_INCIDENT_STATUS_CODE_OPTIONS)));
};

export const fetchMineIncidentCategoryCodeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_INCIDENT_CATEGORY_CODE_OPTIONS));
  return CustomAxios({ selector: getIncidentCategoryCodeOptions })
    .get(ENVIRONMENT.apiUrl + API.INCIDENT_CATEGORY_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_INCIDENT_CATEGORY_CODE_OPTIONS));
      dispatch(staticContentActions.storeMineIncidentCategoryCodeOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_INCIDENT_CATEGORY_CODE_OPTIONS)));
};

export const fetchProvinceCodes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROVINCE_CODES));
  return CustomAxios({ selector: getProvinceOptions })
    .get(ENVIRONMENT.apiUrl + API.PROVINCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROVINCE_CODES));
      dispatch(staticContentActions.storeProvinceCodes(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_PROVINCE_CODES)));
};

export const fetchMineComplianceCodes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_COMPLIANCE_CODES));
  return CustomAxios({ selector: getComplianceCodes })
    .get(ENVIRONMENT.apiUrl + API.COMPLIANCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_COMPLIANCE_CODES));
      dispatch(staticContentActions.storeComplianceCodes(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_COMPLIANCE_CODES)));
};

export const fetchVarianceStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCE_STATUS_OPTIONS));
  return CustomAxios({ selector: getVarianceStatusOptions })
    .get(`${ENVIRONMENT.apiUrl + API.VARIANCE_STATUS_CODES}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCE_STATUS_OPTIONS));
      dispatch(staticContentActions.storeVarianceStatusOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCE_STATUS_OPTIONS)));
};

export const fetchVarianceDocumentCategoryOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_VARIANCE_DOCUMENT_CATEGORY_OPTIONS));
  return CustomAxios({ selector: getVarianceDocumentCategoryOptions })
    .get(`${ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENT_CATEGORY_OPTIONS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_VARIANCE_DOCUMENT_CATEGORY_OPTIONS));
      dispatch(staticContentActions.storeVarianceDocumentCategoryOptions(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_VARIANCE_DOCUMENT_CATEGORY_OPTIONS)));
};

export const fetchMineReportDefinitionOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT_DEFINITIONS()}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
      dispatch(staticContentActions.storeMineReportDefinitionOptions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS)));
};

export const fetchMineReportStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORT_STATUS_OPTIONS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.MINE_REPORT_STATUS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORT_STATUS_OPTIONS));
      dispatch(staticContentActions.storeMineReportStatusOptions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_REPORT_STATUS_OPTIONS)));
};

// notice of work staticContent
export const fetchNoticeOFWorkActivityTypeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS));
      dispatch(staticContentActions.storeNoticeOfWorkActivityTypeOptions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS)));
};

export const fetchNoticeOFWorkUnitTypeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_UNIT_TYPE_OPTIONS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_UNIT_TYPE_OPTIONS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_UNIT_TYPE_OPTIONS));
      dispatch(staticContentActions.storeNoticeOfWorkUnitTypeOptions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_UNIT_TYPE_OPTIONS)));
};

export const fetchNoticeOFWorkApplicationTypeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS));
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS));
      dispatch(staticContentActions.storeNoticeOfWorkApplicationTypeOptions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS)));
};

export const fetchNoticeOFWorkApplicationStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS));
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS));
      dispatch(staticContentActions.storeNoticeOfWorkApplicationStatusOptions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS)));
};

export const fetchNoticeOFWorkApplicationDocumentTypeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_TYPE_OPTIONS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.NOW_APPLICATION_DOCUMENT_TYPE_OPTIONS}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_TYPE_OPTIONS));
      dispatch(staticContentActions.storeNoticeOfWorkApplicationDocumentTypeOptions(response.data));
      return response;
    })
    .catch(() =>
      dispatch(error(reducerTypes.GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_TYPE_OPTIONS))
    );
};

export const fetchNoticeOFWorkUndergroundExplorationTypeOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS));
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + API.NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS));
      dispatch(
        staticContentActions.storeNoticeOfWorkUndergroundExplorationTypeOptions(response.data)
      );
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS)));
};

export const fetchNoticeOFWorkApplicationProgressStatusCodes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOW_APPLICATION_PROGRESS_STATUS_CODES));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.NOW_APPLICATION_PROGRESS_STATUS_CODES}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOW_APPLICATION_PROGRESS_STATUS_CODES));
      dispatch(
        staticContentActions.storeNoticeOfWorkApplicationProgressStatusCodeOptions(response.data)
      );
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOW_APPLICATION_PROGRESS_STATUS_CODES)));
};

export const fetchNoticeOFWorkApplicationPermitTypes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_NOW_APPLICATION_PERMIT_TYPES));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.NOW_APPLICATION_PERMIT_TYPES}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_NOW_APPLICATION_PERMIT_TYPES));
      dispatch(staticContentActions.storeNoticeOfWorkApplicationPermitTypesOptions(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_NOW_APPLICATION_PERMIT_TYPES)));
};
