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

export const fetchLandingPageDashboard = (dashboardId) =>
  CustomAxios({ errorToastMessage: "Unable to fetch dashboard." })
    .get(`${ENVIRONMENT.apiUrl + API.DASHBOARD(dashboardId)}`, createRequestHeader())
    .then((response) => {
      const { dashboard_url } = response.data || {};
      return dashboard_url;
    })
    .catch(() => error(Strings.ERROR));
