import { notification } from "antd";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT, INoticeOfDeparture, ICreateNoD, INodDocumentPayload } from "@mds/common";
import { error, request, success } from "../actions/genericActions";
import {
  ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE,
  CREATE_NOTICE_OF_DEPARTURE,
  GET_DETAILED_NOTICE_OF_DEPARTURE,
  GET_NOTICES_OF_DEPARTURE,
  UPDATE_NOTICE_OF_DEPARTURE,
} from "../constants/reducerTypes";
import CustomAxios from "../customAxios";
import {
  NOTICE_OF_DEPARTURE,
  NOTICES_OF_DEPARTURE,
  NOTICES_OF_DEPARTURE_DOCUMENT,
  NOTICES_OF_DEPARTURE_DOCUMENTS,
} from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import {
  storeNoticeOfDeparture,
  storeNoticesOfDeparture,
} from "../actions/noticeOfDepartureActions";
import { AxiosResponse } from "axios";
import { AppThunk } from "@/store/appThunk.type";

export const createNoticeOfDeparture = (
  payload: Partial<ICreateNoD>
): AppThunk<Promise<AxiosResponse<INoticeOfDeparture>>> => (
  dispatch
): Promise<AxiosResponse<INoticeOfDeparture>> => {
  dispatch(request(CREATE_NOTICE_OF_DEPARTURE));
  dispatch(showLoading("modal"));

  return CustomAxios()
    .post(`${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE()}`, payload, createRequestHeader())
    .then((response: AxiosResponse<INoticeOfDeparture>) => {
      notification.success({
        message: "Successfully created Notice of Departure.",
        duration: 10,
      });
      dispatch(success(CREATE_NOTICE_OF_DEPARTURE));
      return response;
    })
    .catch((err) => {
      dispatch(error(CREATE_NOTICE_OF_DEPARTURE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchNoticesOfDeparture = (mine_guid): AppThunk => (dispatch) => {
  dispatch(request(GET_NOTICES_OF_DEPARTURE));
  dispatch(showLoading());
  const headers = {
    ...createRequestHeader(),
    params: {
      mine_guid,
    },
  };
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE()}`, headers)
    .then((response) => {
      dispatch(success(GET_NOTICES_OF_DEPARTURE));
      dispatch(storeNoticesOfDeparture(response.data));
      return response;
    })
    .catch(() => dispatch(error(GET_NOTICES_OF_DEPARTURE)))
    .finally(() => dispatch(hideLoading()));
};

export const updateNoticeOfDeparture = (
  { nodGuid },
  payload
): AppThunk<Promise<AxiosResponse<INoticeOfDeparture>>> => (
  dispatch
): Promise<AxiosResponse<INoticeOfDeparture>> => {
  dispatch(request(UPDATE_NOTICE_OF_DEPARTURE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .patch(`${ENVIRONMENT.apiUrl}${NOTICE_OF_DEPARTURE(nodGuid)}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully updated Notice of Departure.",
        duration: 10,
      });
      dispatch(success(UPDATE_NOTICE_OF_DEPARTURE));
      return response;
    })
    .catch((err) => {
      dispatch(error(UPDATE_NOTICE_OF_DEPARTURE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchDetailedNoticeOfDeparture = (
  nod_guid
): AppThunk<Promise<AxiosResponse<INoticeOfDeparture>>> => {
  return async (dispatch): Promise<AxiosResponse<INoticeOfDeparture>> => {
    dispatch(request(GET_DETAILED_NOTICE_OF_DEPARTURE));
    dispatch(showLoading());
    try {
      try {
        const response: AxiosResponse<INoticeOfDeparture> = await CustomAxios().get(
          `${ENVIRONMENT.apiUrl}${NOTICE_OF_DEPARTURE(nod_guid)}`,
          createRequestHeader()
        );
        dispatch(success(GET_DETAILED_NOTICE_OF_DEPARTURE));
        dispatch(storeNoticeOfDeparture(response.data));
        return response;
      } catch {
        dispatch(error(GET_DETAILED_NOTICE_OF_DEPARTURE));
      }
    } finally {
      dispatch(hideLoading());
    }
  };
};

export const addDocumentToNoticeOfDeparture = (
  { noticeOfDepartureGuid }: { noticeOfDepartureGuid: string },
  payload: INodDocumentPayload
): AppThunk => (dispatch) => {
  dispatch(showLoading("modal"));
  dispatch(request(ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE));
  return CustomAxios()
    .put(
      `${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE_DOCUMENTS(noticeOfDepartureGuid)}`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE));
      return response;
    })
    .catch((err) => {
      dispatch(error(ADD_DOCUMENT_TO_NOTICE_OF_DEPARTURE));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const removeFileFromDocumentManager = ({
  nod_guid,
  document_manager_guid,
}: {
  nod_guid: string;
  document_manager_guid: string;
}) => {
  if (!document_manager_guid) {
    throw new Error("Must provide document_manager_guid");
  }

  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl + NOTICES_OF_DEPARTURE_DOCUMENT(nod_guid, document_manager_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Successfully deleted document.",
        duration: 10,
      });
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};
