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
  getPartyBusinessRoleOptions,
  getBondStatusOptions,
  getBondTypeOptions,
  getBondDocumentTypeOptions,
  getExemptionFeeStatusOptions,
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
  getDelayTypeOptions,
  getPermitAmendmentTypeOptions,
  getApplicationReasonCodeOptions,
  getApplicationSourceTypeCodeOptions,
  getGovernmentAgencyTypeOptions,
  getConsequenceClassificationStatusCodeOptions,
  getITRBExemptionStatusCodeOptions,
  getTSFOperatingStatusCodeOptions,
  getExplosivesPermitDocumentType,
  getExplosivesPermitStatus,
  getExplosivesPermitMagazineType,
  getProjectSummaryStatusCodes,
  getProjectSummaryDocumentTypes,
  getEMLIContactTypes,
  getProjectSummaryAuthorizationTypes,
  getProjectSummaryPermitTypes,
  getInformationRequirementsTableStatusCodes,
  getInformationRequirementsTableDocumentTypes,
  getMajorMinesApplicationStatusCodes,
  getMajorMinesApplicationDocumentTypes,
  getProjectDecisionPackageStatusCodes,
} = staticContentReducer;

const getVisibilityFilterOption = (_state, showActiveOnly = true) => showActiveOnly;

const getOptions = (transformOptionsFunc, showActiveOnly) => {
  const options = transformOptionsFunc();
  return showActiveOnly && options && options.length > 0
    ? options.filter((o) => o.isActive)
    : options;
};

const createSelectorWrapper = (
  getOptionsMethod,
  transformOptionsMethod,
  transformOptionsFuncArgs = []
) => {
  return createSelector(
    [getVisibilityFilterOption, getOptionsMethod],
    (showActiveOnly, options) => {
      return getOptions(
        () => transformOptionsMethod(options, ...transformOptionsFuncArgs),
        showActiveOnly
      );
    }
  );
};

const getOptionsWrapper = (getOptionsMethod, isShowActiveOnly = true) =>
  isShowActiveOnly ? getOptionsMethod().filter((o) => o.active_ind) : getOptionsMethod();

export const getIncidentFollowupActionOptions = (state, isShowActiveOnly) =>
  getOptionsWrapper(
    () => staticContentReducer.getIncidentFollowupActionOptions(state),
    isShowActiveOnly
  );

// marks all expired compliance codes as 'Repealed'
export const getCurrentComplianceCodes = createSelector([getComplianceCodes], (codes) => {
  return codes.map((code) => {
    if (new Date(code?.expiry_date) < new Date()) {
      code.description = `${code.description} (Repealed)`;
    }
    return code;
  });
});

export const getMineTenureTypeDropdownOptions = createSelectorWrapper(
  getMineTenureTypeOptions,
  createDropDownList,
  ["description", "mine_tenure_type_code", "active_ind"]
);

export const getMineTenureTypesHash = createSelector(
  getMineTenureTypeDropdownOptions,
  createLabelHash
);

export const getMineRegionDropdownOptions = createSelector([getMineRegionOptions], (options) =>
  createDropDownList(options, "description", "mine_region_code")
);

export const getMineRegionHash = createSelector([getMineRegionDropdownOptions], createLabelHash);

export const getGovernmentAgencyDropdownOptions = createSelector(
  [getGovernmentAgencyTypeOptions],
  (options) => createDropDownList(options, "description", "government_agency_type_code")
);

export const getGovernmentAgencyHash = createSelector(
  [getGovernmentAgencyDropdownOptions],
  createLabelHash
);

const createConditionalMineDetails = (optionsObject, key, isShowActiveOnly) => {
  const newArr = {};
  const { tenureTypes } = optionsObject;
  const { options } = optionsObject;

  if (tenureTypes && tenureTypes.length > 0)
    tenureTypes.forEach((type) => {
      const valueArr = [];
      options.forEach((option) => {
        if (
          option.mine_tenure_type_codes.includes(type.mine_tenure_type_code) &&
          option.active_ind === isShowActiveOnly
        ) {
          valueArr.push({
            label: option.description,
            value: option[key],
            isActive: option.active_ind,
          });
          newArr[type.mine_tenure_type_code] = valueArr;
        }
      });
    });
  return newArr;
};

export const getConditionalDisturbanceOptionsHash = createSelector(
  [
    getVisibilityFilterOption,
    (state) => {
      return {
        options: getMineDisturbanceOptions(state),
        tenureTypes: getMineTenureTypeOptions(state),
      };
    },
  ],
  (isShowActiveOnly, options) =>
    createConditionalMineDetails(options, ["mine_disturbance_code"], isShowActiveOnly)
);

export const getConditionalCommodityOptions = createSelector(
  [
    getVisibilityFilterOption,
    (state) => {
      return {
        options: getMineCommodityOptions(state),
        tenureTypes: getMineTenureTypeOptions(state),
      };
    },
  ],
  (isShowActiveOnly, options) =>
    createConditionalMineDetails(options, ["mine_commodity_code"], isShowActiveOnly)
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

export const getDropdownCommodityOptions = createSelectorWrapper(
  getMineCommodityOptions,
  createDropDownList,
  ["description", "mine_commodity_code", "active_ind"]
);

export const getDropdownProvinceOptions = createSelectorWrapper(
  getProvinceOptions,
  createDropDownList,
  ["sub_division_code", "sub_division_code", "active_ind", "address_type_code"]
);

// no need for wrapper, does not have a 'active_ind'
export const getDropdownPermitStatusOptions = createSelector([getPermitStatusOptions], (options) =>
  createDropDownList(options, "description", "permit_status_code")
);

export const getDropdownPermitStatusOptionsHash = createSelector(
  getDropdownPermitStatusOptions,
  createLabelHash
);

export const getDropdownIncidentDocumentTypeOptions = createSelectorWrapper(
  getIncidentDocumentTypeOptions,
  createDropDownList,
  ["description", "mine_incident_document_type_code", "active_ind"]
);

export const getDropdownIncidentFollowupActionOptions = createSelectorWrapper(
  staticContentReducer.getIncidentFollowupActionOptions,
  (options) =>
    createDropDownList(
      options,
      "description",
      "mine_incident_followup_investigation_type_code",
      "active_ind"
    )
);

export const getIncidentFollowupActionHash = createSelector(
  getDropdownIncidentFollowupActionOptions,
  createLabelHash
);

export const getDropdownIncidentDeterminationOptions = createSelectorWrapper(
  getIncidentDeterminationOptions,
  (options) =>
    createDropDownList(
      options,
      "description",
      "mine_incident_determination_type_code",
      "active_ind"
    )
);

export const getIncidentDeterminationHash = createSelector(
  getDropdownIncidentDeterminationOptions,
  createLabelHash
);

export const getDropdownIncidentStatusCodeOptions = createSelectorWrapper(
  getIncidentStatusCodeOptions,
  createDropDownList,
  ["description", "mine_incident_status_code", "active_ind"]
);

export const getDropdownIncidentCategoryCodeOptions = createSelectorWrapper(
  getIncidentCategoryCodeOptions,
  (options) => {
    return options.map((item) => {
      return {
        key: item.mine_incident_category_code,
        title: item.description,
        isActive: !item.is_historic,
        subType: item.parent_mine_incident_category_code ?? null,
      };
    });
  },
  [
    "description",
    "mine_incident_category_code",
    "is_historic",
    "parent_mine_incident_category_code",
  ]
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

export const getDropdownVarianceStatusOptions = createSelectorWrapper(
  getVarianceStatusOptions,
  createDropDownList,
  ["description", "variance_application_status_code", "active_ind"]
);

// Ant design filter options expects the keys to be value/text vs the dropdown which expects value/label
export const getFilterVarianceStatusOptions = createSelectorWrapper(
  getVarianceStatusOptions,
  (options) =>
    options.map(({ description, variance_application_status_code, active_ind }) => ({
      value: variance_application_status_code,
      label: description,
      isActive: active_ind,
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
      isActive: subReasons[0].mine_operation_status_sub_reason.active_ind,
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
      isActive: reasons[0].mine_operation_status_reason.active_ind,
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
      isActive: codes[0].mine_operation_status.active_ind,
    }))
    .value()
    .sort((a, b) => (a.label < b.label ? -1 : 1));

export const getMineStatusDropDownOptions = createSelectorWrapper(
  getMineStatusOptions,
  transformMineStatus
);

export const getDropdownVarianceDocumentCategoryOptions = createSelectorWrapper(
  getVarianceDocumentCategoryOptions,
  (options) =>
    options.map((option) => {
      const composedLabel = `${option.description} Document`;
      return {
        value: option.variance_document_category_code,
        label: composedLabel,
        isActive: option.active_ind,
      };
    })
);

export const getVarianceDocumentCategoryOptionsHash = createSelector(
  [getDropdownVarianceDocumentCategoryOptions],
  createLabelHash
);

export const getDropdownMineReportDefinitionOptions = createSelectorWrapper(
  getMineReportDefinitionOptions,
  createDropDownList,
  ["report_name", "mine_report_definition_guid", "active_ind"]
);

export const getMineReportDefinitionHash = createSelector(
  getMineReportDefinitionOptions,
  (options) =>
    options.reduce(
      (map, mine_report_definition) => ({
        [mine_report_definition.mine_report_definition_guid]: mine_report_definition,
        ...map,
      }),
      {}
    )
);

export const getDropdownMineReportCategoryOptions = createSelectorWrapper(
  getMineReportCategoryOptions,
  createDropDownList,
  ["description", "mine_report_category", "active_ind"]
);

export const getMineReportCategoryOptionsHash = createSelector(
  [getDropdownMineReportCategoryOptions],
  createLabelHash
);

export const getDropdownPermitConditionCategoryOptions = createSelectorWrapper(
  getPermitConditionCategoryOptions,
  createDropDownList,
  ["description", "condition_category_code"]
);

export const getDropdownMineReportStatusOptions = createSelectorWrapper(
  getMineReportStatusOptions,
  createDropDownList,
  ["description", "mine_report_submission_status_code", "active_ind"]
);

export const getMineReportStatusOptionsHash = createSelectorWrapper(
  getDropdownMineReportStatusOptions,
  createLabelHash
);

export const getDropdownPermitAmendmentTypeOptions = createSelectorWrapper(
  getPermitAmendmentTypeOptions,
  createDropDownList,
  ["description", "permit_amendment_type_code", "active_ind"]
);

export const getPermitAmendmentTypeOptionsHash = createSelector(
  [getDropdownPermitAmendmentTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkActivityTypeOptions = createSelectorWrapper(
  getNoticeOfWorkActivityTypeOptions,
  createDropDownList,
  ["description", "activity_type_code", "active_ind"]
);

export const getNoticeOfWorkActivityTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkActivityTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkUnitTypeOptions = createSelectorWrapper(
  getNoticeOfWorkUnitTypeOptions,
  createDropDownList,
  ["short_description", "unit_type_code", "active_ind"]
);

export const getNoticeOfWorkUnitTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkUnitTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationTypeOptions = createSelectorWrapper(
  getNoticeOfWorkApplicationTypeOptions,
  createDropDownList,
  ["description", "notice_of_work_type_code", "active_ind"]
);

export const getNoticeOfWorkApplicationTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkApplicationTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationStatusOptions = createSelectorWrapper(
  getNoticeOfWorkApplicationStatusOptions,
  createDropDownList,
  ["description", "now_application_status_code", "active_ind"]
);

export const getNoticeOfWorkApplicationStatusOptionsHash = createSelector(
  [getDropdownNoticeOfWorkApplicationStatusOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationDocumentTypeOptions = createSelectorWrapper(
  getNoticeOfWorkApplicationDocumentTypeOptions,
  createDropDownList,
  [
    "description",
    "now_application_document_type_code",
    "active_ind",
    "now_application_document_sub_type_code",
  ]
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

export const getDropdownNoticeOfWorkUndergroundExplorationTypeOptions = createSelectorWrapper(
  getNoticeOfWorkUndergroundExplorationTypeOptions,
  createDropDownList,
  ["description", "underground_exploration_type_code", "active_ind"]
);

export const getNoticeOfWorkUndergroundExplorationTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkUndergroundExplorationTypeOptions],
  createLabelHash
);

export const getDropdownNticeOfWorkApplicationStatusCodeOptions = createSelectorWrapper(
  getNoticeOfWorkApplicationProgressStatusCodeOptions,
  createDropDownList,
  ["description", "application_progress_status_code", "active_ind"]
);

export const getNoticeOfWorkApplicationProgressStatusCodeOptionsHash = createSelector(
  [getDropdownNticeOfWorkApplicationStatusCodeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationPermitTypeOptions = createSelectorWrapper(
  getNoticeOfWorkApplicationPermitTypeOptions,
  createDropDownList,
  ["description", "now_application_permit_type_code", "active_ind"]
);
export const getNoticeOfWorkApplicationPermitTypeOptionsHash = createSelector(
  [getDropdownNoticeOfWorkApplicationPermitTypeOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationReviewTypeOptions = createSelectorWrapper(
  getNoticeOfWorkApplicationReviewOptions,
  createDropDownList,
  ["description", "now_application_review_type_code", "active_ind"]
);

export const getNoticeOfWorkApplicationApplicationReviewTypeHash = createSelector(
  [getDropdownNoticeOfWorkApplicationReviewTypeOptions],
  createLabelHash
);

export const getPartyRelationshipTypesList = createSelectorWrapper(
  getPartyRelationshipTypes,
  createDropDownList,
  ["description", "mine_party_appt_type_code", "active_ind"]
);

export const getPartyRelationshipTypeHash = createSelector(
  [getPartyRelationshipTypesList],
  createLabelHash
);

export const getPartyBusinessRoleDropDownOptions = createSelectorWrapper(
  getPartyBusinessRoleOptions,
  createDropDownList,
  ["description", "party_business_role_code", "active_ind"]
);

export const getPartyBusinessRoleOptionsHash = createSelector(
  [getPartyBusinessRoleDropDownOptions],
  createLabelHash
);

export const getBondTypeDropDownOptions = createSelectorWrapper(
  getBondTypeOptions,
  createDropDownList,
  ["description", "bond_type_code", "active_ind"]
);

export const getBondStatusDropDownOptions = createSelectorWrapper(
  getBondStatusOptions,
  createDropDownList,
  ["description", "bond_status_code", "active_ind"]
);

export const getBondDocumentTypeDropDownOptions = createSelectorWrapper(
  getBondDocumentTypeOptions,
  createDropDownList,
  ["description", "bond_document_type_code", "active_ind"]
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

export const getExemptionFeeStatusDropDownOptions = createSelectorWrapper(
  getExemptionFeeStatusOptions,
  createDropDownList,
  ["description", "exemption_fee_status_code", "active_ind"]
);

export const getExemptionFeeStatusOptionsHash = createSelector(
  [getExemptionFeeStatusDropDownOptions],
  createLabelHash
);

export const getDelayTypeDropDownOptions = createSelectorWrapper(
  getDelayTypeOptions,
  createDropDownList,
  ["description", "delay_type_code", "active_ind"]
);

export const getDelayTypeOptionsHash = createSelector(
  [getDelayTypeDropDownOptions],
  createLabelHash
);

export const getApplicationReasonCodeDropdownOptions = createSelectorWrapper(
  getApplicationReasonCodeOptions,
  createDropDownList,
  ["description", "application_reason_code", "active_ind"]
);

export const getApplicationReasonCodeOptionsHash = createSelector(
  [getApplicationReasonCodeDropdownOptions],
  createLabelHash
);

export const getApplicationSourceTypeCodeDropdownOptions = createSelectorWrapper(
  getApplicationSourceTypeCodeOptions,
  createDropDownList,
  ["description", "application_source_type_code", "active_ind"]
);

export const getApplicationSourceTypeCodeOptionsHash = createSelector(
  [getApplicationSourceTypeCodeDropdownOptions],
  createLabelHash
);

export const getConsequenceClassificationStatusCodeDropdownOptions = createSelectorWrapper(
  getConsequenceClassificationStatusCodeOptions,
  createDropDownList,
  ["description", "consequence_classification_status_code", "active_ind", false, null, null, false]
);

export const getConsequenceClassificationStatusCodeOptionsHash = createSelector(
  [getConsequenceClassificationStatusCodeDropdownOptions],
  createLabelHash
);

export const getITRBExemptionStatusCodeDropdownOptions = createSelectorWrapper(
  getITRBExemptionStatusCodeOptions,
  createDropDownList,
  ["description", "itrb_exemption_status_code", "active_ind"]
);

export const getITRBExemptionStatusCodeOptionsHash = createSelector(
  [getITRBExemptionStatusCodeDropdownOptions],
  createLabelHash
);

export const getTSFOperatingStatusCodeDropdownOptions = createSelectorWrapper(
  getTSFOperatingStatusCodeOptions,
  createDropDownList,
  ["description", "tsf_operating_status_code", "active_ind"]
);

export const getTSFOperatingStatusCodeOptionsHash = createSelector(
  [getTSFOperatingStatusCodeDropdownOptions],
  createLabelHash
);

export const getExplosivesPermitDocumentTypeDropdownOptions = createSelectorWrapper(
  getExplosivesPermitDocumentType,
  createDropDownList,
  ["description", "explosives_permit_document_type_code", "active_ind"]
);

export const getExplosivesPermitDocumentTypeOptionsHash = createSelector(
  [getExplosivesPermitDocumentTypeDropdownOptions],
  createLabelHash
);

export const getExplosivesPermitStatusDropdownOptions = createSelectorWrapper(
  getExplosivesPermitStatus,
  createDropDownList,
  ["description", "explosives_permit_status_code", "active_ind"]
);

export const getExplosivesPermitStatusOptionsHash = createSelector(
  [getExplosivesPermitStatusDropdownOptions],
  createLabelHash
);

export const getExplosivesPermitMagazineTypeDropdownOptions = createSelectorWrapper(
  getExplosivesPermitMagazineType,
  createDropDownList,
  ["description", "explosives_permit_magazine_type_code"]
);

export const getExplosivesPermitMagazineTypeOptionsHash = createSelector(
  [getExplosivesPermitMagazineTypeDropdownOptions],
  createLabelHash
);

export const getDropdownNoticeOfWorkApplicationStatusCodes = (...params) =>
  getNoticeOfWorkApplicationProgressStatusCodeOptions(...params);

export const getDropdownProjectSummaryStatusCodes = createSelectorWrapper(
  getProjectSummaryStatusCodes,
  createDropDownList,
  ["description", "project_summary_status_code"]
);

export const getProjectSummaryStatusCodesHash = createSelector(
  [getDropdownProjectSummaryStatusCodes],
  createLabelHash
);

export const getDropdownInformationRequirementsTableStatusCodes = createSelectorWrapper(
  getInformationRequirementsTableStatusCodes,
  createDropDownList,
  ["description", "information_requirements_table_status_code"]
);

export const getInformationRequirementsTableStatusCodesHash = createSelector(
  [getDropdownInformationRequirementsTableStatusCodes],
  createLabelHash
);

export const getDropdownMajorMinesApplicationStatusCodes = createSelectorWrapper(
  getMajorMinesApplicationStatusCodes,
  createDropDownList,
  ["description", "major_mine_application_status_code"]
);

export const getMajorMinesApplicationStatusCodesHash = createSelector(
  [getDropdownMajorMinesApplicationStatusCodes],
  createLabelHash
);

export const getDropdownProjectDecisionPackageStatusCodes = createSelectorWrapper(
  getProjectDecisionPackageStatusCodes,
  createDropDownList,
  ["description", "project_decision_package_status_code"]
);

export const getProjectDecisionPackageStatusCodesHash = createSelector(
  [getDropdownProjectDecisionPackageStatusCodes],
  createLabelHash
);

export const getDropdownProjectSummaryAliasStatusCodes = createSelectorWrapper(
  getProjectSummaryStatusCodes,
  createDropDownList,
  ["alias_description", "project_summary_status_code"]
);

export const getProjectSummaryAliasStatusCodesHash = createSelector(
  [getDropdownProjectSummaryAliasStatusCodes],
  createLabelHash
);

export const getDropdownProjectSummaryDocumentTypes = createSelectorWrapper(
  getProjectSummaryDocumentTypes,
  createDropDownList,
  ["description", "project_summary_document_type_code", "active_ind"]
);

export const getProjectSummaryDocumentTypesHash = createSelector(
  [getDropdownProjectSummaryDocumentTypes],
  createLabelHash
);

export const getDropdownInformationRequirementsTableDocumentTypes = createSelectorWrapper(
  getInformationRequirementsTableDocumentTypes,
  createDropDownList,
  ["description", "information_requirements_table_document_type_code", "active_ind"]
);

export const getInformationRequirementsTableDocumentTypesHash = createSelector(
  [getDropdownInformationRequirementsTableDocumentTypes],
  createLabelHash
);

export const getDropdownMajorMineApplicationDocumentTypes = createSelectorWrapper(
  getMajorMinesApplicationDocumentTypes,
  createDropDownList,
  ["description", "major_mine_application_document_type_code", "active_ind"]
);

export const getMajorMinesApplicationDocumentTypesHash = createSelector(
  [getDropdownMajorMineApplicationDocumentTypes],
  createLabelHash
);

export const getDropdownEMLIContactTypes = createSelectorWrapper(
  getEMLIContactTypes,
  createDropDownList,
  ["description", "emli_contact_type_code", "active_ind"]
);

export const getEMLIContactTypesHash = createSelector(
  [getDropdownEMLIContactTypes],
  createLabelHash
);

export const getTransformedProjectSummaryAuthorizationTypes = createSelector(
  [getProjectSummaryAuthorizationTypes],
  (types) => {
    const parents = types
      .filter(
        ({ project_summary_authorization_type_group_id }) =>
          !project_summary_authorization_type_group_id
      )
      .map(({ project_summary_authorization_type, description }) => {
        return { code: project_summary_authorization_type, description, children: [] };
      });
    // eslint-disable-next-line array-callback-return
    types.map((child) => {
      // eslint-disable-next-line array-callback-return, consistent-return
      parents.map(({ code, children }) => {
        if (code === child.project_summary_authorization_type_group_id) {
          return children.push({
            code: child.project_summary_authorization_type,
            description: child.description,
          });
        }
      });
    });
    return parents;
  }
);

export const getTransformedChildProjectSummaryAuthorizationTypesHash = createSelector(
  [getProjectSummaryAuthorizationTypes],
  (types) => {
    const parents = types
      .filter(
        ({ project_summary_authorization_type_group_id }) =>
          !project_summary_authorization_type_group_id
      )
      .map(({ project_summary_authorization_type, description }) => {
        return { code: project_summary_authorization_type, description, children: [] };
      });
    // eslint-disable-next-line array-callback-return
    types.map((child) => {
      // eslint-disable-next-line array-callback-return, consistent-return
      parents.map(({ code, children }) => {
        if (code === child.project_summary_authorization_type_group_id) {
          return children.push({
            code: child.project_summary_authorization_type,
            description: child.description,
          });
        }
      });
    });
    const transformedObject = {};
    parents.forEach((parent) => {
      return parent.children.forEach((child) => {
        transformedObject[child.code] = {
          description: child.description,
          parent: { code: parent.code, description: parent.description },
        };
      });
    });
    return transformedObject;
  }
);

export const getDropdownProjectSummaryPermitTypes = createSelectorWrapper(
  getProjectSummaryPermitTypes,
  createDropDownList,
  ["description", "project_summary_permit_type"]
);

export const getProjectSummaryPermitTypesHash = createSelector(
  [getDropdownProjectSummaryPermitTypes],
  createLabelHash
);

export const getProjectSummaryAuthorizationTypesArray = createSelector(
  [getProjectSummaryAuthorizationTypes],
  (types) => {
    const arr = [];
    types.map(({ project_summary_authorization_type }) => {
      return arr.push(project_summary_authorization_type);
    });

    return arr;
  }
);
