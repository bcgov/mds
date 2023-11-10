import { DAMS } from "../constants/reducerTypes";
import { STORE_DAM } from "../constants/actionTypes";
import { IDam } from "@mds/common";
import { RootState } from "@mds/common/redux/rootState";

interface DamState {
  dam: IDam;
}

const initialState: DamState = {
  dam: {} as IDam,
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

export const getDam = (state: RootState): IDam => state[DAMS].dam;

export default damReducerObject;
