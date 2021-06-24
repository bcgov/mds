import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as explosivesPermitActions from "../actions/explosivesPermitActions";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

const esup = {
  data: {
    records: [
      {
        esup_guid: "816459817365978135",
        mine_no: "blah-123",
        mine_name: "Test Mine",
        esup_permit_no: "BC-11111",
        permit_no: "P-39039404",
        now_no: "1500615-2021-12",
        issuing_inspector_name: "John",
        issuing_inspector_party_guid: null,
        source: "Core",
        mine_operator_name: "Mike",
        application_no: 52135425,
        mine_operator_guid: null,
        application_date: "2007-12-04",
        issue_date: "2007-12-04",
        expiry_date: "2007-12-04",
        latitude: null,
        longitude: null,
        application_status: "APP",
        documents: [],
        detonator_magazines: [
          {
            type: "DET",
            type_no: "1",
            tag_no: "1",
            construction: "string",
            latitude: null,
            longitude: null,
            length: 1,
            width: 2,
            height: 2,
            quantity: 12,
            distance_road: 70,
            distance_dwelling: 60,
          },
          {
            type: "DET",
            type_no: "1",
            tag_no: "1",
            construction: "string",
            latitude: null,
            longitude: null,
            length: 1,
            width: 2,
            height: 2,
            quantity: 12,
            distance_road: 70,
            distance_dwelling: 60,
          },
        ],
        explosive_magazines: [
          {
            type: "EXP",
            type_no: "1",
            tag_no: "1",
            construction: "string",
            latitude: null,
            longitude: null,
            length: 1,
            width: 2,
            height: 2,
            quantity: 12,
            distance_road: 70,
            distance_dwelling: 60,
          },
        ],
      },
      {
        esup_guid: "81324623978135",
        mine_no: "Blah-blash",
        mine_name: "HILLSIDE MINE",
        esup_permit_no: "BC-145411",
        permit_no: "P-39039404",
        now_no: "1500615-2021-12",
        application_no: 12351235,
        issuing_inspector_name: "John",
        issuing_inspector_party_guid: null,
        source: "Core",
        mine_operator_name: "Mike",
        mine_operator_guid: null,
        application_date: "2007-12-04",
        issue_date: "2007-12-04",
        expiry_date: "2007-12-04",
        latitude: null,
        longitude: null,
        application_status: "REC",
        documents: [],
        detonator_magazines: [
          {
            type: "DET",
            type_no: "1",
            tag_no: "1",
            construction: "string",
            latitude: null,
            longitude: null,
            length: 1,
            width: 2,
            height: 2,
            quantity: 12,
            distance_road: 70,
            distance_dwelling: 60,
          },
          {
            type: "DET",
            type_no: "1",
            tag_no: "1",
            construction: "string",
            latitude: null,
            longitude: null,
            length: 1,
            width: 2,
            height: 2,
            quantity: 12,
            distance_road: 70,
            distance_dwelling: 60,
          },
        ],
        explosive_magazines: [
          {
            type: "EXP",
            type_no: "1",
            tag_no: "1",
            construction: "string",
            latitude: null,
            longitude: null,
            length: 1,
            width: 2,
            height: 2,
            quantity: 12,
            distance_road: 70,
            distance_dwelling: 60,
          },
          {
            type: "EXP",
            type_no: "1",
            tag_no: "1",
            construction: "string",
            latitude: null,
            longitude: null,
            length: 1,
            width: 2,
            height: 2,
            quantity: 12,
            distance_road: 70,
            distance_dwelling: 60,
          },
        ],
      },
    ],
  },
};

export const createExplosivesPermit = (mineGuid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mineGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully created a new permit",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_EXPLOSIVES_PERMIT));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchExplosivesPermits = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_EXPLOSIVES_PERMITS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: String.ERROR })
    .get(ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mineGuid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPLOSIVES_PERMITS));
      dispatch(explosivesPermitActions.storeExplosivesPermits(esup.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_EXPLOSIVES_PERMITS));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
