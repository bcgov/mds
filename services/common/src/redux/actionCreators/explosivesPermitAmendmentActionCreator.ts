import { notification } from "antd";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants";
import { IExplosivesPermitAmendment } from "@mds/common/interfaces";
import { error, request, success } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { AxiosResponse } from "axios";

export const createExplosivesPermitAmendment = (
  payload: Partial<IExplosivesPermitAmendment>
): AppThunk<Promise<AxiosResponse<IExplosivesPermitAmendment>>> => (
  dispatch
): Promise<AxiosResponse<IExplosivesPermitAmendment>> => {
  const { mine_guid } = payload;
  dispatch(request(reducerTypes.CREATE_EXPLOSIVES_PERMIT_AMENDMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(
      ENVIRONMENT.apiUrl + API.CREATE_EXPLOSIVES_PERMIT_AMENDMENT(mine_guid),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully created Explosives Permit Amendment",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_EXPLOSIVES_PERMIT_AMENDMENT));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_EXPLOSIVES_PERMIT_AMENDMENT));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateExplosivesPermitAmendment = (
  payload: Partial<IExplosivesPermitAmendment>,
  generate_documents = false
): AppThunk<Promise<AxiosResponse<IExplosivesPermitAmendment>>> => (
  dispatch
): Promise<AxiosResponse<IExplosivesPermitAmendment>> => {
  const { mine_guid, explosives_permit_amendment_guid } = payload;
  dispatch(request(reducerTypes.UPDATE_EXPLOSIVES_PERMIT_AMENDMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl +
        API.EXPLOSIVES_PERMIT_AMENDMENT(mine_guid, explosives_permit_amendment_guid),
      { ...payload, generate_documents },

      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated Explosives Permit Amendment",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EXPLOSIVES_PERMIT_AMENDMENT));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_EXPLOSIVES_PERMIT_AMENDMENT));
    })
    .finally(() => dispatch(hideLoading("modal")));
};
