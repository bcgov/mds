import { chain } from "lodash";
import { createSelector } from "reselect";
import * as staticContentReducer from "../reducers/staticContentReducer";
import { createLabelHash, createDropDownList, compareCodes } from "../utils/helpers";

export const {
  getStaticContentLoadingIsComplete,
  getMineStatusOptions,
  getMineRegionOptions,
  getMineTenureTypeOptions,
  getMineCommodityOptions,
  getMineDisturbanceOptions,
  getMineReportDefinitionOptions,
  getMineReportStatusOptions,
  getMineReportCategoryOptions,
  getProvinceOptions,
  getPermitStatusOptions,
  getComplianceCodes,
  getIncidentDocumentTypeOptions,
  getIncidentFollowupActionOptions,
  getIncidentDeterminationOptions,
  getIncidentStatusCodeOptions,
  getIncidentCategoryCodeOptions,
  getVarianceStatusOptions,
  getVarianceDocumentCategoryOptions,
  getNoticeOfWorkActivityTypeOptions,
  getNoticeOfWorkUnitTypeOptions,
  getNoticeOfWorkApplicationTypeOptions,
  getNoticeOfWorkApplicationStatusOptions,
  getNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkUndergroundExplorationTypeOptions,
  getNoticeOfWorkApplicationProgressStatusCodeOptions,
  getNoticeOfWorkApplicationPermitTypeOptions,
  getNoticeOfWorkApplicationReviewOptions,
  getPartyRelationshipTypes,
  getBondStatusOptions,
  getBondTypeOptions,
  getBondDocumentTypeOptions,
  getExemptionFeeStatusOptions,
} = staticContentReducer;

// removes all expired compliance codes from the array
export const getCurrentComplianceCodes = createSelector([getComplianceCodes], (codes) =>
  codes.filter((code) => code.expiry_date === null || new Date(code.expiry_date) > new Date())
);

export const getMineTenureTypeDropdownOptions = createSelector(
  [getMineTenureTypeOptions],
  (options) => createDropDownList(options, "description", "mine_tenure_type_code")
);

export const getMineTenureTypesHash = createSelector(
  [getMineTenureTypeDropdownOptions],
  createLabelHash
);

export const getMineRegionDropdownOptions = createSelector([getMineRegionOptions], (options) =>
  createDropDownList(options, "description", "mine_region_code")
);

export const getMineRegionHash = createSelector([getMineRegionDropdownOptions], createLabelHash);

const createConditionalMineDetails = (key) => (options, tenureTypes) => {
  const newArr = {};
  tenureTypes.forEach((type) => {
    const valueArr = [];
    options.forEach((option) => {
      if (option.mine_tenure_type_codes.includes(type.mine_tenure_type_code)) {
        valueArr.push({
          label: option.description,
          value: option[key],
        });
        newArr[type.mine_tenure_type_code] = valueArr;
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

export const getDisturbanceOptionHash = createSelector([getMineDisturbanceOptions], (options) =>
  options.reduce(
    (map, { description, mine_disturbance_code }) => ({
      [mine_disturbance_code]: description,
      ...map,
    }),
    {}
  )
);

export const getCommodityOptionHash = createSelector([getMineCommodityOptions], (options) =>
  options.reduce(
    (map, { description, mine_commodity_code }) => ({
      [mine_commodity_code]: description,
      ...map,
    }),
    {}
  )
);

export const getDropdownCommodityOptions = createSelector([getMineCommodityOptions], (options) =>
  createDropDownList(options, "description", "mine_commodity_code")
);

export const getDropdownProvinceOptions = createSelector([getProvinceOptions], (options) =>
  createDropDownList(options, "sub_division_code", "sub_division_code")
);

export const getDropdownPermitStatusOptions = createSelector([getPermitStatusOptions], (options) =>
  createDropDownList(options, "description", "permit_status_code")
);

export const getDropdownIncidentDocumentTypeOptions = createSelector(
  [getIncidentDocumentTypeOptions],
  (options) => createDropDownList(options, "description", "mine_incident_document_type_code")
);

export const getDropdownIncidentFollowupActionOptions = createSelector(
  [getIncidentFollowupActionOptions],
  (options) =>
    createDropDownList(options, "description", "mine_incident_followup_investigation_type_code")
);

export const getIncidentFollowupActionHash = createSelector(
  [getDropdownIncidentFollowupActionOptions],
  createLabelHash
);

export const getDropdownIncidentDeterminationOptions = createSelector(
  [getIncidentDeterminationOptions],
  (options) => createDropDownList(options, "description", "mine_incident_determination_type_code")
);

export const getIncidentDeterminationHash = createSelector(
  [getDropdownIncidentDeterminationOptions],
  createLabelHash
);

export const getDropdownIncidentStatusCodeOptions = createSelector(
  [getIncidentStatusCodeOptions],
  (options) => createDropDownList(options, "description", "mine_incident_status_code")
);

export const getDropdownIncidentCategoryCodeOptions = createSelector(
  [getIncidentCategoryCodeOptions],
  (options) => createDropDownList(options, "description", "mine_incident_category_code")
);

export const getIncidentStatusCodeHash = createSelector(
  [getDropdownIncidentStatusCodeOptions],
  createLabelHash
);

export const getIncidentCategoryCodeHash = createSelector(
  [getDropdownIncidentCategoryCodeOptions],
  createLabelHash
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
      .sort((a, b) => compareCodes(a.label, b.label))
);

export const getHSRCMComplianceCodesHash = createSelector([getCurrentComplianceCodes], (codes) =>
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

// FIXME:  this seems to double count compliance codes, particularly the dangerous occurences
// this double counting should get removed
export const getMultiSelectComplianceCodes = createSelector([getCurrentComplianceCodes], (codes) =>
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

// Ant design filter options expects the keys to be value/text vs the dropdown which expects value/label
export const getFilterVarianceStatusOptions = createSelector(
  [getVarianceStatusOptions],
  (options) =>
    options.map(({ description, variance_application_status_code }) => ({
      value: variance_application_status_code,
      label: description,
    }))
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
      title: subReasons[0].description,
      children: [],
    }))
    .value()
    .sort((a, b) => (a.label < b.label ? -1 : 1));

const transformMineStatusReason = (codes) =>
  chain(codes)
    .groupBy((s) => s.mine_operation_status_reason.mine_operation_status_reason_code)
    .filter((g) => g[0].mine_operation_status_reason.mine_operation_status_reason_code)
    .map((reasons) => ({
      value: reasons[0].mine_operation_status_reason.mine_operation_status_reason_code,
      label: reasons[0].mine_operation_status_reason.description,
      title: reasons[0].mine_operation_status_sub_reason.mine_operation_status_sub_reason_code
        ? null
        : reasons[0].description,
      children: transformMineStatusSubReason(reasons),
    }))
    .value()
    .sort((a, b) => (a.label < b.label ? -1 : 1));

const transformMineStatus = (data) =>
  chain(data)
    .groupBy((s) => s.mine_operation_status.mine_operation_status_code)
    .map((codes) => ({
      value: codes[0].mine_operation_status.mine_operation_status_code,
      label: codes[0].mine_operation_status.description,
      title: codes[0].mine_operation_status_reason.mine_operation_status_reason_code
        ? null
        : codes[0].description,
      children: transformMineStatusReason(codes),
    }))
    .value()
    .sort((a, b) => (a.label < b.label ? -1 : 1));

export const getMineStatusDropDownOptions = createSelector(
  getMineStatusOptions,
  transformMineStatus
);

export const getDropdownVarianceDocumentCategoryOptions = createSelector(
  [getVarianceDocumentCategoryOptions],
  (options) =>
    options.map((option) => {
      const composedLabel = `${option.description} Document`;
      return {
        value: option.variance_document_category_code,
        label: composedLabel,
      };
    })
);

export const getVarianceDocumentCategoryOptionsHash = createSelector(
  [getDropdownVarianceDocumentCategoryOptions],
  createLabelHash
);

export const getDropdownMineReportDefinitionOptions = createSelector(
  [getMineReportDefinitionOptions],
  (options) => createDropDownList(options, "report_name", "mine_report_definition_guid")
);

export const getMineReportDefinitionHash = createSelector(
  [getMineReportDefinitionOptions],
  (options) =>
    options.reduce(
      (map, mine_report_definition) => ({
        [mine_report_definition.mine_report_definition_guid]: mine_report_definition,
        ...map,
      }),
      {}
    )
);

export const getDropdownMineReportCategoryOptions = createSelector(
  [getMineReportCategoryOptions],
  (options) => createDropDownList(options, "description", "mine_report_category")
);

export const getMineReportCategoryOptionsHash = createSelector(
  [getDropdownMineReportCategoryOptions],
  createLabelHash
);

export const getDropdownMineReportStatusOptions = createSelector(
  [getMineReportStatusOptions],
  (options) => createDropDownList(options, "description", "mine_report_submission_status_code")
);

export const getMineReportStatusOptionsHash = createSelector(
  [getDropdownMineReportStatusOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkActivityTypeOptions = createSelector(
  [getNoticeOfWorkActivityTypeOptions],
  (options) => createDropDownList(options, "description", "activity_type_code")
);

export const getNoticeOfWorkActivityTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkActivityTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkUnitTypeOptions = createSelector(
  [getNoticeOfWorkUnitTypeOptions],
  (options) => createDropDownList(options, "short_description", "unit_type_code")
);

export const getNoticeOfWorkUnitTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkUnitTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationTypeOptions = createSelector(
  [getNoticeOfWorkApplicationTypeOptions],
  (options) => createDropDownList(options, "description", "notice_of_work_type_code")
);

export const getNoticeOfWorkApplicationTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkApplicationTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationStatusOptions = createSelector(
  [getNoticeOfWorkApplicationStatusOptions],
  (options) => createDropDownList(options, "description", "now_application_status_code")
);

export const getNoticeOfWorkApplicationStatusOptionsHash = createSelector(
  [getDropdownNoticeOfWorkApplicationStatusOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationDocumentTypeOptions = createSelector(
  [getNoticeOfWorkApplicationDocumentTypeOptions],
  (options) => createDropDownList(options, "description", "now_application_document_type_code")
);

export const getNoticeOfWorkApplicationDocumentTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkApplicationDocumentTypeOptions],
  createLabelHash
);

export const getGeneratableNoticeOfWorkApplicationDocumentTypeOptions = createSelector(
  [getNoticeOfWorkApplicationDocumentTypeOptions],
  (options) =>
    options
      .filter((option) => option.document_template.document_template_code)
      .reduce(
        (map, option) => ({
          [option.now_application_document_type_code]: option,
          ...map,
        }),
        {}
      )
);

export const getDropdownNoticeOfWorkUndergroundExplorationTypeOptions = createSelector(
  [getNoticeOfWorkUndergroundExplorationTypeOptions],
  (options) => createDropDownList(options, "description", "underground_exploration_type_code")
);

export const getNoticeOfWorkUndergroundExplorationTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkUndergroundExplorationTypeOptions],
  createLabelHash
);

export const getDropdownNticeOfWorkApplicationStatusCodeOptions = createSelector(
  [getNoticeOfWorkApplicationProgressStatusCodeOptions],
  (options) => createDropDownList(options, "description", "application_progress_status_code")
);

export const getNoticeOfWorkApplicationProgressStatusCodeOptionsHash = createSelector(
  [getDropdownNticeOfWorkApplicationStatusCodeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationPermitTypeOptions = createSelector(
  [getNoticeOfWorkApplicationPermitTypeOptions],
  (options) => createDropDownList(options, "description", "now_application_permit_type_code")
);

export const getDropdownNoticeOfWorkApplicationReviewTypeOptions = createSelector(
  [getNoticeOfWorkApplicationReviewOptions],
  (options) => createDropDownList(options, "description", "now_application_review_type_code")
);

export const getNoticeOfWorkApplicationApplicationReviewTypeHash = createSelector(
  [getDropdownNoticeOfWorkApplicationReviewTypeOptions],
  createLabelHash
);

export const getPartyRelationshipTypesList = createSelector(
  [getPartyRelationshipTypes],
  (options) => createDropDownList(options, "description", "mine_party_appt_type_code")
);

export const getPartyRelationshipTypeHash = createSelector(
  [getPartyRelationshipTypesList],
  createLabelHash
);

export const getBondTypeDropDownOptions = createSelector([getBondTypeOptions], (options) =>
  createDropDownList(options, "description", "bond_type_code")
);

export const getBondStatusDropDownOptions = createSelector([getBondStatusOptions], (options) =>
  createDropDownList(options, "description", "bond_status_code")
);

export const getBondDocumentTypeDropDownOptions = createSelector(
  [getBondDocumentTypeOptions],
  (options) => createDropDownList(options, "description", "bond_document_type_code")
);

export const getBondTypeOptionsHash = createSelector([getBondTypeDropDownOptions], createLabelHash);

export const getBondStatusOptionsHash = createSelector(
  [getBondStatusDropDownOptions],
  createLabelHash
);

export const getBondDocumentTypeOptionsHash = createSelector(
  [getBondDocumentTypeDropDownOptions],
  createLabelHash
);

export const getExemptionFeeSatusDropDownOptions = createSelector(
  [getExemptionFeeStatusOptions],
  (options) => createDropDownList(options, "description", "exemption_fee_status_code")
);

export const getExemptionFeeStatusOptionsHash = createSelector(
  [getExemptionFeeSatusDropDownOptions],
  createLabelHash
);
