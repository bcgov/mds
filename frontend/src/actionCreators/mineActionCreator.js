import axios from 'axios';
import { notification } from 'antd';

import { request, success, error } from '@/actions/genericActions';
import * as reducerTypes from '@/constants/reducerTypes';
import * as mineActions from '@/actions/mineActions';
import * as String from '@/constants/strings';
import * as API from '@/constants/API';

const createRequestHeader = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
});

export const createMineRecord = (mineName) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  return axios.post(API.BASE_URL + API.MINE, {"name": mineName}, createRequestHeader())
  .then((response) => {
    notification.success({ message: "Successfully created: " + mineName, duration: 10 });
    dispatch(success(reducerTypes.CREATE_MINE_RECORD));
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.CREATE_MINE_RECORD));
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