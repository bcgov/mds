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
export const getMineTSFRequiredDocumentsHash = createSelector(
  [getMineTSFRequiredReports],
  (requiredDocuments) =>
    requiredDocuments.reduce((map, { value, label }) => ({ [value]: label, ...map }), {})
);

export const getConditionalDisturbanceOptionsHash = createSelector(
  [getMineDisturbanceOptions, getMineTenureTypes],
  (disturbanceOptions, tenureTypes) => {
    const newArr = {};
    tenureTypes.forEach((type) => {
      const valueArr = [];
      disturbanceOptions.forEach((option) => {
        if (option.mine_tenure_type_codes.includes(type.value)) {
          valueArr.push({
            label: option.description,
            value: option.mine_disturbance_code,
            exclusive: option.exclusive_ind,
          });
          newArr[type.value] = valueArr;
        }
      });
    });
    return newArr;
  }
);
