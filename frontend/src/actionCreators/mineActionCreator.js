import axios from 'axios';
import { notification } from 'antd';

import { request, success, error } from '../actions/genericActions';
import * as reducerTypes from '../constants/reducerTypes';
import * as mineActions from '../actions/mineActions';
import * as String from '../constants/strings';
import * as API from '../constants/API';

const createRequestHeader = () => ({
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
});

export const createMineRecord = (mineName) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_MINE_RECORD));
  // Should change from get to post
  return axios.get(API.BASE_URL + API.HELLO, createRequestHeader())
  .then((response) => {
    notification.success({ message: mineName, duration: 10 });
    dispatch(success(reducerTypes.CREATE_MINE_RECORD));
    dispatch(mineActions.addMine(mineName));
  })
  .catch(() => {
      notification.error({message: String.ERROR, duration: 10});
      dispatch(error(reducerTypes.CREATE_MINE_RECORD));
    });
};