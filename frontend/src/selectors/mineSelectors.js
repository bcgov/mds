import * as mineReducer from "@/reducers/mineReducer";
import { createSelector } from "reselect";

export const getMines = (state) => mineReducer.getMines(state);
export const getMineIds = (state) => mineReducer.getMineIds(state);
export const getMineNames = (state) => mineReducer.getMineNames(state);
export const getMinesPageData = (state) => mineReducer.getMinesPageData(state);
export const getMineGuid = (state) => mineReducer.getMineGuid(state);
export const getMineStatusOptions = (state) =>
  mineReducer.getMineStatusOptions(state);
export const getMineRegionOptions = (state) =>
  mineReducer.getMineRegionOptions(state);
export const getExpectedDocumentStatusOptions = (state) =>
  mineReducer.getExpectedDocumentStatusOptions(state);
export const getMineTailingsRequiredDocuments = (state) =>
  mineReducer.getMineTailingsRequiredDocuments(state);

export const getCurrentPermittees = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    const permitteeObj = {};
    if (mineGuid) {
      mines[mineGuid].mine_permit.map((permit) => {
        permitteeObj[permit.permittee[0].party_guid] = permit.permittee[0];
      });
    }
    return permitteeObj;
  }
);

export const getCurrentPermitteeIds = createSelector(
  [getMines, getMineGuid],
  (mines, mineGuid) => {
    const permitteeIds = [];
    let unique;
    if (mineGuid) {
      mines[mineGuid].mine_permit.map((permit) => {
        permitteeIds.push(permit.permittee[0].party_guid);
      });
    }
    unique = [...new Set(permitteeIds)];
    return unique;
  }
);

export const getMineRegionHash = createSelector(
  [getMineRegionOptions],
  (regions) => {
    return regions.reduce(
      (map, { value, label }) => ({ [value]: label, ...map }),
      {}
    );
  }
);
