import { createSelector } from "reselect";
import * as varianceReducer from "@/reducers/varianceReducer";
import * as Strings from "@/constants/strings";
import { createLabelHash, createDropDownList } from "@/utils/helpers";

export const {
  getMineVariances,
  getComplianceCodes,
  getVarianceStatusOptions,
  getVariance,
} = varianceReducer;

export const getVarianceApplications = createSelector(
  [getMineVariances],
  (variances) =>
    variances.filter(
      ({ variance_application_status_code }) =>
        variance_application_status_code !== Strings.VARIANCE_APPROVED_CODE
    )
);

export const getApprovedVariances = createSelector(
  [getMineVariances],
  (variances) =>
    variances.filter(
      ({ variance_application_status_code }) =>
        variance_application_status_code === Strings.VARIANCE_APPROVED_CODE
    )
);

// removes all expired compliance codes from the array
export const getCurrentComplianceCodes = createSelector(
  [getComplianceCodes],
  (codes) =>
    codes.filter((code) => code.expiry_date === null || new Date(code.expiry_date) > new Date())
);

export const formatComplianceCodeValueOrLabel = (code, showDescription) => {
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
      .filter(({ article_act_code }) => article_act_code === "HSRCM")
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

export const getDropdownVarianceStatusOptions = createSelector(
  [getVarianceStatusOptions],
  (options) => createDropDownList(options, "description", "variance_application_status_code")
);

export const getVarianceStatusOptionsHash = createSelector(
  [getDropdownVarianceStatusOptions],
  createLabelHash
);
