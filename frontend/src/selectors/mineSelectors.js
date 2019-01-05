import * as mineReducer from "@/reducers/mineReducer";
import { createSelector } from "reselect";

export const getMines = (state) => mineReducer.getMines(state);
export const getMineIds = (state) => mineReducer.getMineIds(state);
export const getMineNames = (state) => mineReducer.getMineNames(state);
export const getMinesPageData = (state) => mineReducer.getMinesPageData(state);
export const getMineGuid = (state) => mineReducer.getMineGuid(state);
export const getMineBasicInfoList = (state) => mineReducer.getMineBasicInfoList(state);

export const getCurrentPermittees = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    const permitteeObj = {}; /* 
    if (mineGuid) {
      mines[mineGuid].mine_permit.forEach((permit) => {
        const permittee = permit.permittee[0];
        permitteeObj[permittee.party_guid] = permittee;
      });
    } */
    return permitteeObj;
  }
);

export const getCurrentPermitteeIds = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    const permitteeIds = [];
    let unique; /* 
    if (mineGuid) {
      mines[mineGuid].mine_permit.forEach((permit) => {
        permitteeIds.push(permit.permittee[0].party_guid);
      });
    } */
    unique = [...new Set(permitteeIds)];
    return unique;
  }
);

export const getCurrentMineTypes = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    if (mineGuid) {
      const mineTypesArr = mines[mineGuid].mine_type.map((type) => {
        const mine_types = {
          mine_tenure_type_code: "",
          mine_commodity_code: [],
          mine_disturbance_code: [],
        };
        mine_types.mine_tenure_type_code = type.mine_tenure_type_code;
        type.mine_type_detail.map((detail) => {
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
  }
);
