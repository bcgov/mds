import { ENVIRONMENT } from "@mds/common";
import { error } from "../actions/genericActions";
import * as Strings from "../constants/strings";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchMetabaseDashboard = (dashboardId) =>
  CustomAxios({ errorToastMessage: "Unable to fetch dashboard." })
    .get(`${ENVIRONMENT.apiUrl + API.DASHBOARD(dashboardId)}`, createRequestHeader())
    .then((response) => {
      const { dashboard_url } = response.data || {};
      return dashboard_url;
    })
    .catch(() => error(Strings.ERROR));
