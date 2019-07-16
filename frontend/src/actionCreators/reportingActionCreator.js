import { error } from "@/actions/genericActions";
import * as Strings from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

export const fetchCoreDashboard = () =>
  CustomAxios({ errorToastMessage: "Unable to fetch dashboard." })
    .get(`${ENVIRONMENT.apiUrl + API.CORE_DASHBOARD}`, createRequestHeader())
    .then((response) => {
      const { dashboard_url } = response.data || {};
      return dashboard_url;
    })
    .catch(() => error(Strings.ERROR));

export const fetchDashboard164 = () =>
  CustomAxios({ errorToastMessage: "Unable to fetch dashboard." })
    .get(`${ENVIRONMENT.apiUrl + API.DASHBOARD_164}`, createRequestHeader())
    .then((response) => {
      const { dashboard_url } = response.data || {};
      return dashboard_url;
    })
    .catch(() => error(Strings.ERROR));

export const fetchDashboard165 = () =>
  CustomAxios({ errorToastMessage: "Unable to fetch dashboard." })
    .get(`${ENVIRONMENT.apiUrl + API.DASHBOARD_165}`, createRequestHeader())
    .then((response) => {
      const { dashboard_url } = response.data || {};
      return dashboard_url;
    })
    .catch(() => error(Strings.ERROR));
