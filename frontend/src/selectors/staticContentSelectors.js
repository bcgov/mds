import { chain } from "lodash";
import * as staticContentReducer from "@/reducers/staticContentReducer";
import { createSelector } from "reselect";
import { createLabelHash, createDropDownList } from "@/utils/helpers";

export const {
  getMineStatusOptions,
  getMineRegionOptions,
  getMineTenureTypeOptions,
  getMineCommodityOptions,
  getMineDisturbanceOptions,
  getExpectedDocumentStatusOptions,
  getMineTSFRequiredReports,
  getOptionsLoaded,
  getProvinceOptions,
  getPermitStatusOptions,
  getApplicationStatusOptions,
  getComplianceCodes,
  getIncidentFollowupActionOptions,
  getIncidentDeterminationOptions,
  getVarianceStatusOptions,
} = staticContentReducer;

// removes all expired compliance codes from the array
export const getCurrentComplianceCodes = createSelector(
  [getComplianceCodes],
  (codes) =>
    codes.filter((code) => code.expiry_date === null || new Date(code.expiry_date) > new Date())
);

export const getMineTenureTypesHash = createSelector(
  [getMineTenureTypeOptions],
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
  [getMineDisturbanceOptions, getMineTenureTypeOptions],
  createConditionalMineDetails("mine_disturbance_code")
);

export const getConditionalCommodityOptions = createSelector(
  [getMineCommodityOptions, getMineTenureTypeOptions],
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

export const getDropdownIncidentFollowupActionOptions = createSelector(
  [getIncidentFollowupActionOptions],
  (options) => createDropDownList(options, "description", "mine_incident_followup_type_code")
);

export const getDropdownIncidentDeterminationOptions = createSelector(
  [getIncidentDeterminationOptions],
  (options) => createDropDownList(options, "description", "mine_incident_determination_type_code")
);

const formatComplianceCodeValueOrLabel = (code, showDescription) => {
  const { section, sub_section, paragraph, sub_paragraph, description } = code;
  const formattedSubSection = sub_section ? `.${sub_section}` : "";
  const formattedParagraph = paragraph ? `.${paragraph}` : "";
  const formattedSubParagraph = sub_paragraph !== null ? `.${sub_paragraph}` : "";
  const formattedDescription = showDescription ? ` - ${description}` : "";

  return `${section}${formattedSubSection}${formattedParagraph}${formattedSubParagraph}${formattedDescription}`;
};

export const getDropdownHSRCMComplianceCodes = createSelector(
  [getCurrentComplianceCodes],
  (codes) =>
    codes
      .filter((code) => code.article_act_code === "HSRCM" && code.sub_paragraph === null)
      .map((code) => {
        const composedLabel = formatComplianceCodeValueOrLabel(code, true);
        return { value: code.compliance_article_id, label: composedLabel };
      })
);

export const getHSRCMComplianceCodesHash = createSelector(
  [getCurrentComplianceCodes],
  (codes) =>
    codes
      .filter(({ article_act_code }) => article_act_code === "HSRCM")
      .reduce((map, code) => {
        const composedValue = formatComplianceCodeValueOrLabel(code, true);
        return {
          [code.compliance_article_id]: composedValue,
          ...map,
        };
      }, {})
);

export const getDangerousOccurrenceSubparagraphOptions = createSelector(
  [getCurrentComplianceCodes],
  (codes) =>
    codes
      .filter(
        (code) =>
          code.article_act_code === "HSRCM" &&
          code.section === "1" &&
          code.sub_section === "7" &&
          code.paragraph === "3" &&
          code.sub_paragraph !== null
      )
      .map((code) => {
        const composedLabel = formatComplianceCodeValueOrLabel(code, true);
        return {
          value: code.compliance_article_id,
          label: composedLabel,
          tooltip: code.long_description,
        };
      })
);

export const getMultiSelectComplianceCodes = createSelector(
  [getCurrentComplianceCodes],
  (codes) =>
    codes.map((code) => {
      const composedValue = formatComplianceCodeValueOrLabel(code);
      const composedLabel = formatComplianceCodeValueOrLabel(code, true);
      return { value: composedValue, label: composedLabel };
    })
);

export const getDropdownVarianceStatusOptions = createSelector(
  [getVarianceStatusOptions],
  (options) => createDropDownList(options, "description", "variance_application_status_code")
);

export const getVarianceStatusOptionsHash = createSelector(
  [getDropdownVarianceStatusOptions],
  createLabelHash
);

const transformMineStatusSubReason = (reasons) =>
  chain(reasons)
    .groupBy((s) => s.mine_operation_status_sub_reason.mine_operation_status_sub_reason_code)
    .filter((g) => g[0].mine_operation_status_sub_reason.mine_operation_status_sub_reason_code)
    .map((subReasons) => ({
      value: subReasons[0].mine_operation_status_sub_reason.mine_operation_status_sub_reason_code,
      label: subReasons[0].mine_operation_status_sub_reason.description,
      children: [],
    }))
    .value();

const transformMineStatusReason = (codes) =>
  chain(codes)
    .groupBy((s) => s.mine_operation_status_reason.mine_operation_status_reason_code)
    .filter((g) => g[0].mine_operation_status_reason.mine_operation_status_reason_code)
    .map((reasons) => ({
      value: reasons[0].mine_operation_status_reason.mine_operation_status_reason_code,
      label: reasons[0].mine_operation_status_reason.description,
      children: transformMineStatusSubReason(reasons),
    }))
    .value();

const transformMineStatus = (data) =>
  chain(data)
    .groupBy((s) => s.mine_operation_status.mine_operation_status_code)
    .map((codes) => ({
      value: codes[0].mine_operation_status.mine_operation_status_code,
      label: codes[0].mine_operation_status.description,
      children: transformMineStatusReason(codes),
    }))
    .value();

export const getMineStatusDropDownOptions = createSelector(
  getMineStatusOptions,
  transformMineStatus
);
