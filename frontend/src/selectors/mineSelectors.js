import * as mineReducer from "@/reducers/mineReducer";
import { createSelector } from "reselect";

export const getMines = (state) => mineReducer.getMines(state);
export const getMineIds = (state) => mineReducer.getMineIds(state);
export const getMineNames = (state) => mineReducer.getMineNames(state);
export const getMinesPageData = (state) => mineReducer.getMinesPageData(state);
export const getMineGuid = (state) => mineReducer.getMineGuid(state);

export const getCurrentPermittees = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    const permitteeObj = {};
    if (mineGuid) {
      mines[mineGuid].mine_permit.forEach((permit) => {
        const permittee = permit.permittee[0];
        permitteeObj[permittee.party_guid] = permittee;
      });
    }
    return permitteeObj;
  }
);

export const getCurrentPermitteeIds = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    const permitteeIds = [];
    if (mineGuid) {
      mines[mineGuid].mine_permit.forEach((permit) => {
        permitteeIds.push(permit.permittee[0].party_guid);
      });
    }
    return [...new Set(permitteeIds)];
  }
);
