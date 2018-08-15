import axios from 'axios';
import { notification } from 'antd';

import { request, success, error } from '@/actions/genericActions';
import * as reducerTypes from '@/constants/reducerTypes';
import * as personnelActions from '@/actions/personnelActions';
import * as String from '@/constants/strings';
import * as API from '@/constants/API';
import { ENVIRONMENT } from '@/constants/environment'

const createRequestHeader = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
  }
});

export const createPersonnel = (firstName, surname) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_PERSONNEL));
  return axios.post(ENVIRONMENT.apiUrl + API.PERSON, { "first_name": firstName, "surname": surname }, createRequestHeader())
    .then((response) => {
      notification.success({ message: "Successfully created: " + firstName + surname, duration: 10 });
      dispatch(success(reducerTypes.CREATE_PERSONNEL));
      console.log(response);
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

export const getPersonnel = (id) => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERSONNEL));
  return axios.get(ENVIRONMENT.apiUrl + API.PERSONS + "/" + id, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERSONNEL));
      dispatch(personnelActions.storePersonnel(response.data, id));
    })
    .catch(() => {
      notification.error({ message: String.ERROR, duration: 10 });
      dispatch(error(reducerTypes.GET_PERSONNEL));
    });
};