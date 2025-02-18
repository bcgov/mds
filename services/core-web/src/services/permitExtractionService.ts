import CustomAxios from "@mds/common/redux/customAxios";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { ENVIRONMENT } from "@mds/common/constants/environment";
export const GET_PERMIT_EXTRACTION_STATS = "/mines/permits/condition-extraction-dashboard";
export const getPermitExtractionStats = () => CustomAxios().get(`${ENVIRONMENT.apiUrl}${GET_PERMIT_EXTRACTION_STATS}`, createRequestHeader());
