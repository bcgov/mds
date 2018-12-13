import * as staticContentReducer from "@/reducers/staticContentReducer";
import { createSelector } from "reselect";
import { createLabelHash } from "@/utils/helpers";

export const getMineStatusOptions = (state) => staticContentReducer.getMineStatusOptions(state);
export const getMineRegionOptions = (state) => staticContentReducer.getMineRegionOptions(state);
export const getMineTenureTypes = (state) => staticContentReducer.getMineTenureTypes(state);
export const getMineDisturbanceOptions = (state) =>
  staticContentReducer.getMineDisturbanceOptions(state);
export const getExpectedDocumentStatusOptions = (state) =>
  staticContentReducer.getExpectedDocumentStatusOptions(state);
export const getMineTSFRequiredReports = (state) =>
  staticContentReducer.getMineTSFRequiredReports(state);

export const getMineTenureTypesHash = createSelector(
  [getMineTenureTypes],
  createLabelHash
);
export const getMineRegionHash = createSelector(
  [getMineRegionOptions],
  createLabelHash
);
