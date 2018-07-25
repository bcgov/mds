import axios from 'axios';
import { notification } from 'antd';

import { request, success, error } from '../actions/genericActions';
import * as reducerTypes from '../constants/reducerTypes';
import * as String from '../constants/strings';
import * as API from '../constants/API';

const createRequestHeader = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
});

export const createMineRecord = () => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  return axios.get(API.BASE_URL + API.HELLO, createRequestHeader())
  .then((response) => {
    notification.success({ message: response.data.msg, duration: 10 });
    dispatch(success(reducerTypes.CREATE_MINE_RECORD));
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.CREATE_MINE_RECORD));
    });
};