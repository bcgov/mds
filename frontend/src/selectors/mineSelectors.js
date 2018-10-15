import * as mineReducer from '@/reducers/mineReducer';
import { createSelector } from 'reselect'

export const getMines = (state) => mineReducer.getMines(state);
export const getMineIds = (state) => mineReducer.getMineIds(state);
export const getMineNames = (state) => mineReducer.getMineNames(state);
export const getMinesPageData = (state) => mineReducer.getMinesPageData(state);

export const getCurrentPermittees = createSelector(
  [getMines, getMineIds], 
  (mines, mineIds) => {
    const permitteeObj = {};
    mineIds.map((id) => {
      mines[id].mine_permit.map((permit) => {
        permitteeObj[permit.permittee[0].party_guid] = permit.permittee[0];
      })
    })
    return permitteeObj;
  }
);

export const getCurrentPermitteeIds = createSelector(
  [getMines, getMineIds], 
  (mines, mineIds) => {
    const permitteeIds = [];
    let unique;
    mineIds.map((id) => {
      mines[id].mine_permit.map((permit) => {
        permitteeIds.push(permit.permittee[0].party_guid);
      })
    })
    unique = [...new Set(permitteeIds)];
    return unique;
  }
);
