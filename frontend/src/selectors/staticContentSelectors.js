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
  getOptionsLoaded,
  getProvinceOptions,
  getPermitStatusOptions,
  getApplicationStatusOptions,
  getComplianceCodes,
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

export const getDropdownProvinceOptions = createSelector(
  [getProvinceOptions],
  (options) => createDropDownList(options, "sub_division_code", "sub_division_code")
);

export const getDropdownPermitStatusOptions = createSelector(
  [getPermitStatusOptions],
  (options) => createDropDownList(options, "description", "permit_status_code")
);

export const getDropdownApplicationStatusOptions = createSelector(
  [getApplicationStatusOptions],
  (options) => createDropDownList(options, "description", "application_status_code")
);

export const getDropdownHSRCMComplianceCodes = createSelector(
  [getComplianceCodes],
  (codes) =>
    codes
      .filter(({ article_act_code }) => article_act_code === "HSRCM")
      .map((code) => {
        const composedLabel = `${code.section}.${code.sub_section}.${code.paragraph} - ${
          code.description
        }`;
        return { value: code.compliance_article_id, label: composedLabel };
      })
);

export const getHSRCMComplianceCodesHash = createSelector(
  [getComplianceCodes],
  (codes) =>
    codes
      .filter(({ article_act_code }) => article_act_code === "HSRCM")
      .reduce((map, code) => {
        const composedValue = `${code.section}.${code.sub_section}.${code.paragraph} - ${
          code.description
        }`;
        return {
          [code.compliance_article_id]: composedValue,
          ...map,
        };
      }, {})
);
