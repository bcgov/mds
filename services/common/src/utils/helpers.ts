import { isArray } from "lodash";
import { removeNullValuesRecursive } from "@mds/common/constants/utils";
import { AMS_AUTHORIZATION_TYPES } from "@mds/common/constants/enums";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import { IMineReportPermitRequirement, IPermitAmendment } from "../interfaces/permits";
import { REPORT_FREQUENCY_HASH, REPORT_MINISTRY_RECIPIENT_HASH, REPORT_REGULATORY_AUTHORITY_CODES_HASH } from "../constants/strings";

const transformAuthorizations = (
  valuesFromForm: any,
  projectSummaryAuthorizationTypesArray: any
) => {
  const { authorizations = {}, project_summary_guid } = valuesFromForm;

  const transformAuthorization = (type, authorization) => {
    return { ...authorization, project_summary_authorization_type: type, project_summary_guid };
  };
  let updatedAuthorizations = [];
  let newAmsAuthorizations = [];
  let amendAmsAuthorizations = [];

  projectSummaryAuthorizationTypesArray.forEach((type) => {
    const authsOfType = authorizations[type];
    if (authsOfType) {
      if (isArray(authsOfType)) {
        const formattedAuthorizations = authsOfType.map((a) => {
          return transformAuthorization(type, a);
        });
        updatedAuthorizations = updatedAuthorizations.concat(formattedAuthorizations);
      } else {
        newAmsAuthorizations = newAmsAuthorizations.concat(
          authsOfType?.NEW.map((a) =>
            transformAuthorization(type, {
              ...a,
              project_summary_permit_type: [AMS_AUTHORIZATION_TYPES.NEW],
            })
          )
        );
        amendAmsAuthorizations = amendAmsAuthorizations.concat(
          authsOfType?.AMENDMENT.map((a) =>
            transformAuthorization(type, {
              ...a,
              project_summary_permit_type: [AMS_AUTHORIZATION_TYPES.AMENDMENT],
            })
          )
        );
      }
    }
  });
  return {
    authorizations: updatedAuthorizations,
    ams_authorizations: { amendments: amendAmsAuthorizations, new: newAmsAuthorizations },
  };
};

export const formatProjectPayload = (valuesFromForm: any, params: any) => {
  let payloadValues: any = {};
  const { projectSummaryAuthorizationTypesArray } = params;
  const updatedAuthorizations = transformAuthorizations(
    valuesFromForm,
    projectSummaryAuthorizationTypesArray
  );
  const values = removeNullValuesRecursive(valuesFromForm);
  payloadValues = {
    ...values,
    ...updatedAuthorizations,
  };
  delete payloadValues.authorizationTypes;
  return payloadValues;
};

export const parsePermitConditionStep = (step: string) => {
  if (step?.length > 0) {
    return step.replace(".", "");
  }
  return step;
}

export const formatPermitConditionStep = (step: string, condition?: string) => {
  let formattedStep = "";
  if (step?.length > 0) {
    if (step.endsWith(".")) {
      formattedStep = step;
    } else {
      formattedStep = `${step}.`;
    }
  }

  if (!condition) {
    return formattedStep;
  }

  return formattedStep != "" ? `${formattedStep} ${condition}` : condition;
}

export const getConditionsWithRequirements = (conditions: IPermitCondition[], requirements?: IMineReportPermitRequirement[]) => {
  let result = [];

  const requirementsByCondition = requirements?.length ? requirements.reduce((acc, requirement) => {
    if (!acc[requirement.permit_condition_id]) {
      acc[requirement.permit_condition_id] = [];
    }
    acc[requirement.permit_condition_id].push(requirement);
    return acc;
  }, {}) : {};

  conditions.forEach((condition) => {
    if (requirements && condition?.permit_condition_id) {
      const reqs = requirementsByCondition[condition.permit_condition_id];
      const conditionWithRequirement = reqs?.map(req => ({ ...condition, mineReportPermitRequirement: req }));
      result = [...result, ...(conditionWithRequirement || [])];
    } else if (condition?.mineReportPermitRequirement) {
      result.push(condition);
    }

    if (condition?.sub_conditions?.length > 0) {
      result = result.concat(getConditionsWithRequirements(condition.sub_conditions, requirements));
    }
  });

  return result;
};

/**
     * Find a condition recursively by guid or id in the given list of conditions.
     */
export const findCondition = (permit_condition: string | number, conditions: IPermitCondition[]) => {

  const findConditionRecursive = (value: string | number, condition: IPermitCondition): IPermitCondition | null => {
      // Check if either permit_condition_guid or permit_condition_id matches the given value
      if (condition?.permit_condition_guid === value || condition?.permit_condition_id === value) {
          return condition;
      }

      if (condition.sub_conditions) {
          for (const sub of condition.sub_conditions) {
              const found = findConditionRecursive(value, sub);
              if (found) return found;
          }
      }
      return null;
  };

  for (const condition of conditions) {
      const found = findConditionRecursive(permit_condition, condition);
      if (found) return found;
  }
  return null;
}

/** IMineReportPermitRequirement transformer */
/** Logic from ReportPermitRequirementForm TODO use this transformer too? */

export const transformPermitReportRequirement = (report : IMineReportPermitRequirement) => {
  if(report){
    return {
      report_name: report.report_name,
      formattedConditionStep: "",
      mine_report_permit_requirement_id: report.mine_report_permit_requirement_id,
      regulatory_authority: report.cim_or_cpo ? REPORT_REGULATORY_AUTHORITY_CODES_HASH[report.cim_or_cpo] : "Not Specified",
      ministry_recipient: report.ministry_recipient?.map(
        (dest,index) => 
        `${REPORT_MINISTRY_RECIPIENT_HASH[dest]}${index < report.ministry_recipient.length - 1 ? ", " : ""} `
      ) ?? "None Specified",
      permit_condition_id: report.permit_condition_id,
      frequency: Object.keys(REPORT_FREQUENCY_HASH).find(key => REPORT_FREQUENCY_HASH[key] === report.due_date_period_months),
      initial_due_date: report.initial_due_date,
      condition_category_code: report.condition_category_code
    }
  } 
  return null;
}