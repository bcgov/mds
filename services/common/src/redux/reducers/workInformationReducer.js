import * as actionTypes from "@mds/common/constants/actionTypes";
import { MINE_WORK_INFORMATIONS } from "@mds/common/constants/reducerTypes";

const initialState = {
  mineWorkInformations: [],
};

export const workInformationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_WORK_INFORMATIONS:
      return {
        ...state,
        mineWorkInformations: action.payload.records,
      };
    default:
      return state;
  }
};

const workInformationReducerObject = {
  [MINE_WORK_INFORMATIONS]: workInformationReducer,
};

export const getMineWorkInformations = (state) =>
  state[MINE_WORK_INFORMATIONS].mineWorkInformations;

export default workInformationReducerObject;
