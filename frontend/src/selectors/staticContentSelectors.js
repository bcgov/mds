import * as staticContentReducer from "@/reducers/staticContentReducer";
import { createSelector } from "reselect";
import { createLabelHash, createDropDownList } from "@/utils/helpers";

export const {
  getMineStatusOptions,
  getMineRegionOptions,
  getMineTenureTypes,
  getMineCommodityOptions,
  getMineDisturbanceOptions,
  getExpectedDocumentStatusOptions,
  getMineTSFRequiredReports,
} = staticContentReducer;

export const getMineTenureTypesHash = createSelector(
  [getMineTenureTypes],
  createLabelHash
);
export const getMineRegionHash = createSelector(
  [getMineRegionOptions],
  createLabelHash
);

const createConditionalMineDetails = (key) => (options, tenureTypes) => {
  const newArr = {};
  tenureTypes.forEach((type) => {
    const valueArr = [];
    options.forEach((option) => {
      if (option.mine_tenure_type_codes.includes(type.value)) {
        valueArr.push({
          label: option.description,
          value: option[key],
        });
        newArr[type.value] = valueArr;
      }
    });
  });
  return newArr;
};
export const getConditionalDisturbanceOptionsHash = createSelector(
  [getMineDisturbanceOptions, getMineTenureTypes],
  createConditionalMineDetails("mine_disturbance_code")
);

export const getConditionalCommodityOptions = createSelector(
  [getMineCommodityOptions, getMineTenureTypes],
  createConditionalMineDetails("mine_commodity_code")
);

export const getDisturbanceOptionHash = createSelector(
  [getMineDisturbanceOptions],
  (options) =>
    options.reduce(
      (map, { description, mine_disturbance_code }) => ({
        [mine_disturbance_code]: description,
        ...map,
      }),
      {}
    )
);

export const getCommodityOptionHash = createSelector(
  [getMineCommodityOptions],
  (options) =>
    options.reduce(
      (map, { description, mine_commodity_code }) => ({
        [mine_commodity_code]: description,
        ...map,
      }),
      {}
    )
);

export const getDropdownCommodityOptions = createSelector(
  [getMineCommodityOptions],
  (options) => createDropDownList(options, "description", "mine_commodity_code")
);
