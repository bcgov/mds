import { createSelector } from "reselect";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import * as permitReducer from "../reducers/permitReducer";
import { IMineReportPermitRequirement, IPermitAmendment, IPermitCondition, IPermitConditionCategory } from "@mds/common/interfaces";
import { getPermitConditionCategoryOptions } from "./staticContentSelectors";
import { uniqBy, memoize } from "lodash";
import { formatPermitConditionStep } from "@mds/common/utils/helpers";
import { RootState } from "../rootState";

const draft = "DFT";

export const {
  getUnformattedPermits,
  getDraftPermits,
  getPermitConditions,
  getStandardPermitConditions,
  getEditingConditionFlag,
  getEditingPreambleFlag,
  getLatestPermitAmendments,
  getPermitAmendments
} = permitReducer;

export const getDraftPermitForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) =>
    draftPermits?.find(({ permit_amendments }) =>
      permit_amendments.some(
        (amendment) => amendment.now_application_guid === noticeOfWork.now_application_guid
      )
    ) || {}
);

export const getDraftPermitAmendmentForNOW = createSelector(
  [getDraftPermits, getNoticeOfWork],
  (draftPermits, noticeOfWork) => {
    const draftPermit = draftPermits?.find(({ permit_amendments }) =>
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

export const getPermitByGuid = (permitGuid, isNowDraft = false) =>
  createSelector([getUnformattedPermits, getDraftPermitForNOW], (permits, nowDraft) => {
    if (isNowDraft && nowDraft.permit_guid == permitGuid) {
      return formatPermit(nowDraft);
    }
    const permitList = isNowDraft ? [nowDraft] : permits;
    const permit = permitList.find((p) => p.permit_guid === permitGuid);
    return permit && formatPermit(permit);
  });

export const getLatestAmendmentByPermitGuid = (permitGuid) =>
  createSelector([getLatestPermitAmendments], (amendments) => {
    return amendments ? amendments[permitGuid] : null;
  });

export const getAmendment = memoize(
  (permitGuid: string, amendmentGuid: string, isNowDraft = false): ((state: RootState) => IPermitAmendment) =>
    createSelector(
      [getPermitByGuid(permitGuid, isNowDraft)],
      (permit): IPermitAmendment => {
        return permit?.permit_amendments?.find((amendment) => amendment.permit_amendment_guid === amendmentGuid);
      }
    ),
  (permitGuid, amendmentGuid, isNowDraft) => `${permitGuid}_${amendmentGuid}_${isNowDraft}`
);

export const getAmendmentByGuid = (amendmentGuid: string) =>
  createSelector([getPermitAmendments], (amendments) => {
    return amendments[amendmentGuid];
  });

export const getPermits = createSelector([getUnformattedPermits], (permits) => {
  const formattedPermits = permits.map((permit) => formatPermit(permit));
  return formattedPermits;
});

export const getMineReportPermitRequirementsByAmendment = memoize(
  (permitGuid: string, amendmentGuid: string, isNowDraft = false): ((state: RootState) => IMineReportPermitRequirement[]) =>
    createSelector(
      [getAmendment(permitGuid, amendmentGuid, isNowDraft)],
      (amendment): IMineReportPermitRequirement[] => {
        return (amendment && amendment.mine_report_permit_requirements) ?? [];
      }
    ),
  (permitGuid, amendmentGuid, isNowDraft) => `${permitGuid}_${amendmentGuid}_${isNowDraft}`
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

const getSubConditionIds = (conditions: IPermitCondition[]) => {
  if (!conditions?.length) {
    return [];
  }
  const topLevelIds = conditions.map((c) => c.permit_condition_id);
  const ids = conditions.reduce((acc, c) => {
    const subConditionIds = getSubConditionIds(c.sub_conditions);
    return [...acc, ...subConditionIds]
  }, topLevelIds);
  return ids;
};

// conditionId must be for top-level condition
export const getReportRequirementsByCondition = (permitGuid, permitAmendmentGuid, conditionId, isNowDraft = false) =>
  createSelector(
    [getAmendment(permitGuid, permitAmendmentGuid, isNowDraft), getMineReportPermitRequirementsByAmendment(permitGuid, permitAmendmentGuid, isNowDraft)],
    (amendment, requirements) => {
      if (!amendment || !requirements.length) {
        return [];
      }
      const condition = amendment.conditions.find((c) => c.permit_condition_id === conditionId);
      if (!condition) {
        return [];
      }
      const allConditionIds = getSubConditionIds([condition]);
      const reqByCondition = requirements.filter((r) => r.permit_condition_ids.some((id) => allConditionIds.includes(id)));
      return reqByCondition;
    }
  );

export const getStepPath = (condition, category, conditionMap, parentPath = "", reportRequirements = []): IPermitCondition => {
  const formattedStep = formatPermitConditionStep(condition.step);

  const currentPath = parentPath
    ? `${parentPath}${formattedStep}`
    : `${category.description} - ${formattedStep}`;
  const stepPath = currentPath.replace(/\.+$/, "");

  const mineReportPermitRequirement = reportRequirements.find(
    (requirement) => requirement.permit_condition_ids.includes(condition.permit_condition_id)
  );

  const sub_conditions =
    condition.sub_conditions?.map((subCondition) =>
      getStepPath(subCondition, currentPath, conditionMap, currentPath, reportRequirements)
    ) ?? [];

  const formattedCondition = {
    ...condition,
    formattedStep,
    stepPath,
    mineReportPermitRequirement,
    sub_conditions,
  };

  conditionMap[condition.permit_condition_id] = formattedCondition;

  return formattedCondition;
};

export const getPermitConditionCategories = (permitGuid, permitAmendmentGuid) =>
  createSelector(
    [getAmendment(permitGuid, permitAmendmentGuid), getPermitConditionCategoryOptions, getMineReportPermitRequirementsByAmendment(permitGuid, permitAmendmentGuid)],
    (currentAmendment, defaultPermitConditionCategories, mineReportPermitRequirements) => {

      const condWithoutConditionsText = defaultPermitConditionCategories?.map((cat) => ({
        ...cat,
        description: cat.description.replace("Conditions", "").trim(),
      }));

      const permitConditionCategoryOptions: IPermitConditionCategory[] = uniqBy(
        [
          ...(currentAmendment?.condition_categories ?? []),
          ...(condWithoutConditionsText ?? [])
        ],
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

          const formattedConditions = catConditions.map((condition) => getStepPath(condition, cat, conditionMap, "", mineReportPermitRequirements));

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

export const getNowDraftConditionsFormatted =
  createSelector([getDraftPermitAmendmentForNOW, getPermitConditionCategoryOptions],
    (amendment, categories) => {
      const { conditions, mine_report_permit_requirements } = amendment;

      if (!conditions || !categories) {
        return {
          conditionMap: {},
          categoriesWithConditions: []
        };
      }
      const conditionMap: { [permit_condition_id: string]: IPermitCondition } = {}

      const categoriesWithConditions = categories.map((cat) => {
        const catConditions = conditions.filter((c) =>
          c.condition_category_code === cat.condition_category_code
        );
        const formattedConditions = catConditions.map((condition) => getStepPath(condition, cat, conditionMap, "", mine_report_permit_requirements));

        return {
          ...cat,
          conditions: formattedConditions
        }
      });

      return {
        categoriesWithConditions,
        conditionMap
      };
    }
  );

export const getStandardPermitConditionsFormatted = () =>
  createSelector([getStandardPermitConditions, getPermitConditionCategoryOptions],
    (conditions, categories) => {
      if (!conditions || !categories) {
        return {
          conditionMap: {},
          categoriesWithConditions: []
        }
      }

      const conditionMap: { [permit_condition_id: string]: IPermitCondition } = {}

      const categoriesWithConditions = categories.map((cat) => {
        const catConditions = conditions.filter((c) =>
          c.condition_category_code === cat.condition_category_code
        );
        const formattedConditions = catConditions.map((condition) => getStepPath(condition, cat, conditionMap));

        return {
          ...cat,
          conditions: formattedConditions
        }
      });

      return {
        categoriesWithConditions,
        conditionMap
      };
    });
