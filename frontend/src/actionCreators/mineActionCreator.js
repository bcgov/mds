import axios from 'axios';
import { notification } from 'antd';

import { request, success, error } from '@/actions/genericActions';
import * as reducerTypes from '@/constants/reducerTypes';
import * as mineActions from '@/actions/mineActions';
import * as String from '@/constants/strings';
import * as API from '@/constants/API';
import { ENVIRONMENT } from '@/constants/environment'

const createRequestHeader = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Authorization': localStorage.getItem('jwt')
  }
});

export const createMineRecord = (mineName) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  return axios.post(ENVIRONMENT.apiUrl + API.MINE, {"name": mineName}, createRequestHeader())
  .then((response) => {
    notification.success({ message: "Successfully created: " + mineName, duration: 10 });
    dispatch(success(reducerTypes.CREATE_MINE_RECORD));
    return response;
  })
  .catch(() => {
    notification.error({message: String.ERROR, duration: 10});
    dispatch(error(reducerTypes.CREATE_MINE_RECORD));
  });
};

export const updateMineRecord = (id, tenureNumber) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_MINE_RECORD));
  return axios.put(ENVIRONMENT.apiUrl + API.MINE + "/" + id , {"tenure_number_id": tenureNumber}, createRequestHeader())
  .then((response) => {
    notification.success({ message: "Successfully updated: " + id, duration: 10 });
    dispatch(success(reducerTypes.UPDATE_MINE_RECORD));
    return response;
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.UPDATE_MINE_RECORD));
    });
};

export const getMineRecords = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_RECORDS));
  return axios.get(ENVIRONMENT.apiUrl + API.MINE_LIST, createRequestHeader())
  .then((response) => {
    dispatch(success(reducerTypes.GET_MINE_RECORDS));
    dispatch(mineActions.storeMines(response.data));
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.GET_MINE_RECORD));
    });
};

export const getMineRecord = (mineNo) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_RECORD));
  return axios.get(ENVIRONMENT.apiUrl + API.MINE + "/" + mineNo, createRequestHeader())
  .then((response) => {
    dispatch(success(reducerTypes.GET_MINE_RECORD));
    dispatch(mineActions.storeMine(response.data, mineNo));
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.GET_MINE_RECORD));
    });
};