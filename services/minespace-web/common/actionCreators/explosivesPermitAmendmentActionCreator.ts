import { notification } from "antd";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT, IExplosivesPermit, IExplosivesPermitAmendment } from "@mds/common";
import { error, request, success } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AppThunk } from "@/store/appThunk.type";
import { AxiosResponse } from "axios";

export const updateExplosivesPermitAmendment = (
  mineGuid: string,
  explosivesPermitAmendmentGuid: string,
  payload: Partial<IExplosivesPermit>,
  generate_documents = false
): AppThunk<Promise<AxiosResponse<IExplosivesPermit>>> => (
  dispatch
): Promise<AxiosResponse<IExplosivesPermitAmendment>> => {
  dispatch(request(reducerTypes.UPDATE_EXPLOSIVES_PERMIT_AMENDMENT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMIT_AMENDMENT(mineGuid, explosivesPermitAmendmentGuid),
      { ...payload, generate_documents },
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully updated Explosives Permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_EXPLOSIVES_PERMIT_AMENDMENT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_EXPLOSIVES_PERMIT_AMENDMENT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};
