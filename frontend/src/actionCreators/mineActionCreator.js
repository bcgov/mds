import axios from 'axios';
import { notification } from 'antd';
import { Redirect } from 'react-router-dom';

import { request, success, error } from '@/actions/genericActions';
import * as reducerTypes from '@/constants/reducerTypes';
import * as mineActions from '@/actions/mineActions';
import * as String from '@/constants/strings';
import * as API from '@/constants/API';
import * as routes from '@/constants/routes';

const createRequestHeader = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
});

export const createMineRecord = (mineName) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  return axios.post(API.BASE_URL + API.MINE + "/some_mine_no" , {"name": mineName}, createRequestHeader())
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
  return axios.put(API.BASE_URL + API.MINE + "/" + id , {"tenure_number_id": tenureNumber}, createRequestHeader())
  .then((response) => {
    notification.success({ message: "Successfully updated: " + id, duration: 10 });
    dispatch(success(reducerTypes.UPDATE_MINE_RECORD));
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.UPDATE_MINE_RECORD));
    });
};

export const getMineRecords = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_RECORDS));
  return axios.get(API.BASE_URL + API.MINE_LIST, createRequestHeader())
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
  return axios.get(API.BASE_URL + API.MINE + "/" + mineNo, createRequestHeader())
  .then((response) => {
    console.log(response.data)
    dispatch(success(reducerTypes.GET_MINE_RECORD));
    dispatch(mineActions.storeMine(response.data));
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.GET_MINE_RECORD));
    });
};