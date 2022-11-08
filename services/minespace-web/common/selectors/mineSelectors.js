import { createSelector } from "reselect";
import * as mineReducer from "../reducers/mineReducer";

export const getMines = (state) => mineReducer.getMines(state);
export const getMineIds = (state) => mineReducer.getMineIds(state);
export const getMineNames = (state) => mineReducer.getMineNames(state);
export const getMinesPageData = (state) => mineReducer.getMinesPageData(state);
export const getMineGuid = (state) => mineReducer.getMineGuid(state);
export const getMineBasicInfoList = (state) => mineReducer.getMineBasicInfoList(state);
export const getMineDocuments = (state) => mineReducer.getMineDocuments(state);
export const getSubscribedMines = (state) => mineReducer.getSubscribedMines(state);
export const getMineComments = (state) => mineReducer.getMineComments(state);
export const getMineAlerts = (state) => mineReducer.getMineAlerts(state);

export const getIsUserSubscribed = createSelector(
  [getSubscribedMines, getMineGuid],
  (subscribedMines, mineGuid) =>
    mineGuid ? subscribedMines.map(({ mine_guid }) => mine_guid).includes(mineGuid) : false
);

export const getCurrentMineTypes = createSelector([getMines, getMineGuid], (mines, mineGuid) => {
  if (mineGuid) {
    const mineTypesArr = mines[mineGuid].mine_type
      .filter(({ permit_guid }) => !permit_guid)
      .map((type) => {
        const mine_types = {
          mine_tenure_type_code: "",
          mine_commodity_code: [],
          mine_disturbance_code: [],
        };
        mine_types.mine_tenure_type_code = type.mine_tenure_type_code;
        type.mine_type_detail.forEach((detail) => {
          if (detail.mine_commodity_code) {
            mine_types.mine_commodity_code.push(detail.mine_commodity_code);
          } else if (detail.mine_disturbance_code) {
            mine_types.mine_disturbance_code.push(detail.mine_disturbance_code);
          }
        });
        return mine_types;
      });
    return mineTypesArr;
  }
  return undefined;
});

export const getTransformedMineTypes = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    const mine_types = {
      mine_tenure_type_code: [],
      mine_commodity_code: [],
      mine_disturbance_code: [],
    };
    if (mineGuid) {
      mines[mineGuid].mine_type.forEach((type) => {
        mine_types.mine_tenure_type_code.push(type.mine_tenure_type_code);
        type.mine_type_detail.forEach((detail) => {
          if (detail.mine_commodity_code) {
            mine_types.mine_commodity_code.push(detail.mine_commodity_code);
          } else if (detail.mine_disturbance_code) {
            mine_types.mine_disturbance_code.push(detail.mine_disturbance_code);
          }
        });
      });
      return mine_types;
    }
    return undefined;
  }
);

export const getMineBasicInfoListHash = createSelector([getMineBasicInfoList], (info) =>
  info.reduce(
    (map, { mine_guid, mine_name }) => ({
      [mine_guid]: mine_name,
      ...map,
    }),
    {}
  )
);
