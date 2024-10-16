import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants";
import { IExplosivesPermit } from "@mds/common/interfaces";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as explosivesPermitActions from "../actions/explosivesPermitActions";
import * as String from "@mds/common/constants/strings";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { AxiosResponse } from "axios";

export const createExplosivesPermit = (
  mineGuid: string,
  payload: Partial<IExplosivesPermit>
): AppThunk<Promise<AxiosResponse<IExplosivesPermit>>> => (
  dispatch
): Promise<AxiosResponse<IExplosivesPermit>> => {
  dispatch(request(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mineGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created Explosives Permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchExplosivesPermits = (
  mineGuid: string
): AppThunk<Promise<AxiosResponse<IExplosivesPermit[]>>> => (
  dispatch
): Promise<AxiosResponse<IExplosivesPermit[]>> => {
  dispatch(request(reducerTypes.GET_EXPLOSIVES_PERMITS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: String.ERROR })
    .get(ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPLOSIVES_PERMITS));
      dispatch(explosivesPermitActions.storeExplosivesPermits(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.GET_EXPLOSIVES_PERMITS));
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateExplosivesPermit = (
  payload: Partial<IExplosivesPermit>,
  generate_documents = false
): AppThunk<Promise<AxiosResponse<IExplosivesPermit>>> => (
  dispatch
): Promise<AxiosResponse<IExplosivesPermit>> => {
  const { mine_guid, explosives_permit_guid } = payload;
  dispatch(request(reducerTypes.UPDATE_EXPLOSIVES_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMIT(mine_guid, explosives_permit_guid),
      { ...payload, generate_documents },
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated Explosives Permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EXPLOSIVES_PERMIT));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_EXPLOSIVES_PERMIT));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const deleteExplosivesPermit = (
  mineGuid: string,
  explosivesPermitGuid: string
): AppThunk<Promise<AxiosResponse<null>>> => (dispatch): Promise<AxiosResponse<null>> => {
  dispatch(request(reducerTypes.DELETE_EXPLOSIVES_PERMIT));
  dispatch(showLoading());
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}${API.EXPLOSIVES_PERMIT(mineGuid, explosivesPermitGuid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted Explosives Permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_EXPLOSIVES_PERMIT));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.DELETE_EXPLOSIVES_PERMIT));
    })
    .finally(() => dispatch(hideLoading()));
};
