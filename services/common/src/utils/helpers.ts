import { isArray } from "lodash";
import { removeNullValuesRecursive } from "@mds/common/constants/utils";
import { AMS_AUTHORIZATION_TYPES } from "@mds/common/constants/enums";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import { IMineReportPermitRequirement } from "../interfaces/permits";

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

export const formatPermitConditionStep = (step: string) => {
  if (step?.length > 0) {
    if (step.endsWith(".")) {
      return step;
    }
    return `${step}.`
  }
  return "";
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