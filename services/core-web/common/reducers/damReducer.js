import { DAMS } from "../constants/reducerTypes";
import { STORE_DAM } from "../constants/actionTypes";

const initialState = {
  dam: {},
};

export const damReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORE_DAM:
      return {
        dam: action.payload,
      };
    default:
      return state;
  }
};

const damReducerObject = {
  [DAMS]: damReducer,
};

export const getDam = (state) => state[DAMS].dam;

export default damReducerObject;
