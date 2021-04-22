import * as activityReducer from "../reducers/activityReducer";
import { createSelector } from "reselect";

export const createActivityHash = (arr) => 
    arr.reduce((map, { target_guid }) => ({ [target_guid]: 'yes', ...map }), {});
  //arr.reduce((map, { target_guid, name }) => ({ [target_guid]: name, ...map }), {});

export const { getCoreActivities, getCoreActivityTargets, getUserCoreActivities } = activityReducer;

export const getCoreActivityTargetsHash = createSelector(
    [getCoreActivityTargets],
    createActivityHash
  );