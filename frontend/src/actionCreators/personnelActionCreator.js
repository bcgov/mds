import axios from 'axios';
import { notification } from 'antd';
import { request, success, error } from '@/actions/genericActions';
import * as reducerTypes from '@/constants/reducerTypes';
import * as personnelActions from '@/actions/personnelActions';
import * as String from '@/constants/strings';
import * as API from '@/constants/API';
import { ENVIRONMENT } from '@/constants/environment'
import { createRequestHeader } from '@/utils/RequestHeaders';


export const createPersonnel = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PERSONNEL));
  return axios.post(ENVIRONMENT.apiUrl + API.PERSON, payload, createRequestHeader())
    .then((response) => {
      notification.success({ message: "Successfully created: " + payload.first_name + " " + payload.surname, duration: 10 });
      dispatch(success(reducerTypes.CREATE_PERSONNEL));
      return response;
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.CREATE_PERSONNEL));
    });
};

export const getPersonnelList = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERSONNEL_LIST));
  return axios.get(ENVIRONMENT.apiUrl + API.PERSONS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERSONNEL_LIST));
      dispatch(personnelActions.storePersonnelList(response.data));
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.GET_PERSONNEL_LIST));
    });
};

export const getPersonnelById = (id) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERSONNEL));
  return axios.get(ENVIRONMENT.apiUrl + API.PERSON + "/" + id, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERSONNEL));
      dispatch(personnelActions.storePersonnel(response.data, id));
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.GET_PERSONNEL));
    });
};

export const addMineManager = (mineId, personnelId, mineName, date) => (dispatch) => {
  dispatch(request(reducerTypes.ADD_MINE_MANAGER));
  return axios.post(ENVIRONMENT.apiUrl + API.MANAGER, { "mine_guid": mineId, "person_guid": personnelId, "effective_date": date }, createRequestHeader())
    .then((response) => {
      notification.success({ message: "Successfully updated the manager of " + mineName, duration: 10 });
      dispatch(success(reducerTypes.ADD_MINE_MANAGER));
      return response;
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.ADD_MINE_MANAGER));
    });
};