import { createSelector } from "reselect";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import * as permitReducer from "../reducers/permitReducer";
import { IMineReportPermitRequirement, IPermitAmendment, IPermitCondition, IPermitConditionCategory } from "@mds/common/interfaces";
import { getPermitConditionCategoryOptions } from "./staticContentSelectors";
import { uniqBy } from "lodash";
import { formatPermitConditionStep } from "@mds/common/utils/helpers";

const draft = "DFT";

export const {
  getUnformattedPermits,
  getDraftPermits,
  getPermitConditions,
  getStandardPermitConditions,
  getEditingConditionFlag,
  getEditingPreambleFlag,
  getLatestPermitAmendments
} = permitReducer;

export const getDraftPermitForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) =>
    draftPermits.find(({ permit_amendments }) =>
      permit_amendments.some(
        (amendment) => amendment.now_application_guid === noticeOfWork.now_application_guid
      )
    ) || {}
);

export const getDraftPermitAmendmentForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) => {
    const draftPermit = draftPermits.find(({ permit_amendments }) =>
      permit_amendments.some(
        (amendment) => amendment.now_application_guid === noticeOfWork.now_application_guid
      )
    );
    return draftPermit && draftPermit.permit_amendments.length > 0
      ? draftPermit.permit_amendments.filter(
        (amendment) =>
          amendment.now_application_guid === noticeOfWork.now_application_guid &&
          amendment.permit_amendment_status_code === draft
      )[0]
      : {};
  }
);

export const formatPermit = (permit) => {
  const site_properties = {
    mine_tenure_type_code: "",
    mine_commodity_code: [],
    mine_disturbance_code: [],
  };

  let activePermitSiteProperty = site_properties;
  if (permit.site_properties.length > 0) {
    activePermitSiteProperty = permit.site_properties.map((type) => {
      site_properties.mine_tenure_type_code = type.mine_tenure_type_code;
      type.mine_type_detail.forEach((detail) => {
        if (detail.mine_commodity_code) {
          site_properties.mine_commodity_code.push(detail.mine_commodity_code);
        } else if (detail.mine_disturbance_code) {
          site_properties.mine_disturbance_code.push(detail.mine_disturbance_code);
        }
      });
      return site_properties;
    })[0];
  }
  return { ...permit, site_properties: activePermitSiteProperty };
};

export const getPermitByGuid = (permitGuid) =>
  createSelector([getUnformattedPermits], (permits) => {
    const permit = permits.find((p) => p.permit_guid === permitGuid);
    return permit && formatPermit(permit);
  });

export const getLatestAmendmentByPermitGuid = (permitGuid) =>
  createSelector([getLatestPermitAmendments], (amendments) => {
    return amendments ? amendments[permitGuid] : null;
  });

export const getAmendment = (permitGuid, amendmentGuid) =>
  createSelector([getPermitByGuid(permitGuid)], (permit): IPermitAmendment => {
    return permit?.permit_amendments?.find((amendment) => amendment.permit_amendment_guid === amendmentGuid);
  });

export const getPermits = createSelector([getUnformattedPermits], (permits) => {
  const formattedPermits = permits.map((permit) => formatPermit(permit));
  return formattedPermits;
});

export const getMineReportPermitRequirementsByAmendment = (permitGuid, amendmentGuid) =>
  createSelector(
    [getAmendment(permitGuid, amendmentGuid)],
    (amendment): IMineReportPermitRequirement[] => {
      return (amendment && amendment.mine_report_permit_requirements) ?? [];
    }
  );


export const getMineReportPermitRequirements = (permitGuid) =>
  createSelector(
    [getLatestAmendmentByPermitGuid(permitGuid)],
    (latestAmendment): IMineReportPermitRequirement[] => {
      return (latestAmendment && latestAmendment.mine_report_permit_requirements) ?? [];
    }
  );

export const getMineReportPermitRequirementById = (permitGuid, reportId) =>
  createSelector(
    [getLatestAmendmentByPermitGuid(permitGuid)],
    (latestAmendment): IMineReportPermitRequirement => {
      return latestAmendment?.mine_report_permit_requirements?.find((report) => report.mine_report_permit_requirement_id === reportId);
    }
  );

export const getCategoriesWithReports = (permitGuid) => createSelector([getLatestAmendmentByPermitGuid(permitGuid)], (latestAmendment) => {
  return latestAmendment?.condition_categories.map((category) => {
    const reports = latestAmendment.mine_report_permit_requirements.filter((report) => category.condition_category_code === report.condition_category_code);
    return {
      ...category,
      reports
    }
  })
})

export const getPermitConditionCategories = (permitGuid, permitAmendmentGuid) =>
  createSelector(
    [getAmendment(permitGuid, permitAmendmentGuid), getPermitConditionCategoryOptions, getMineReportPermitRequirementsByAmendment(permitGuid, permitAmendmentGuid)],
    (currentAmendment, defaultPermitConditionCategories, mineReportPermitRequirements) => {

      const condWithoutConditionsText = defaultPermitConditionCategories?.map((cat) => ({
        ...cat,
        description: cat.description.replace("Conditions", "").trim(),
      }));

      const permitConditionCategoryOptions: IPermitConditionCategory[] = uniqBy(
        currentAmendment?.condition_categories.concat(condWithoutConditionsText) ?? [],
        "condition_category_code"
      );

      const conditionMap: { [permit_condition_id: string]: IPermitCondition } = {};

      const categoriesWithConditions = permitConditionCategoryOptions
        .map((cat) => {
          const catConditions = currentAmendment?.conditions?.filter(
            (c) => c.condition_category_code === cat.condition_category_code
          ) ?? [];

          const isDefaultConditionCategory = !!condWithoutConditionsText?.find(
            (x) => x.condition_category_code === cat.condition_category_code
          );

          if (!catConditions.length && isDefaultConditionCategory) {
            return null;
          }

          const getStepPath = (condition, parentPath = ""): IPermitCondition => {
            const formattedStep = formatPermitConditionStep(condition.step);

            const currentPath = parentPath
              ? `${parentPath}${formattedStep}`
              : `${cat.description} - ${formattedStep}`;
            const stepPath = currentPath.replace(/\.+$/, "");

            const mineReportPermitRequirement = mineReportPermitRequirements.find(
              (requirement) => requirement.permit_condition_id === condition.permit_condition_id
            );

            const sub_conditions =
              condition.sub_conditions?.map((subCondition) =>
                getStepPath(subCondition, currentPath)
              ) ?? [];

            conditionMap[condition.permit_condition_id] = {
              ...condition,
              formattedStep,
              stepPath,
              mineReportPermitRequirement,
              sub_conditions,
            };

            return {
              ...condition,
              formattedStep,
              stepPath,
              mineReportPermitRequirement,
              sub_conditions,
            };
          };

          const formattedConditions = catConditions.map((condition) => getStepPath(condition));

          return {
            ...cat,
            conditions: formattedConditions,
          };
        })
        .filter(Boolean);

      return {
        categoriesWithConditions,
        conditionMap,
      };
    }
  );
