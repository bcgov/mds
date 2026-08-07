import { isArray } from "lodash";
import { removeNullValuesRecursive } from "@mds/common/constants/utils";
import { AMS_AUTHORIZATION_TYPES } from "@mds/common/constants/enums";
import { IPermitCondition } from "@mds/common/interfaces/permits/permitCondition.interface";
import { IMineReportPermitRequirement } from "../interfaces/permits";
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

export const containsConditionId = (conditions: IPermitCondition[], targetId: number | null): boolean => {
  if (!targetId || !conditions?.length) return false;
  return conditions.some(
    (c) => c.permit_condition_id === targetId || containsConditionId(c.sub_conditions ?? [], targetId)
  );
};

/** IMineReportPermitRequirement transformer */
/** Logic from ReportPermitRequirementForm TODO use this transformer too? */

export const transformPermitReportRequirement = (report: IMineReportPermitRequirement) => {
  if (report) {
    return {
      report_name: report.report_name,
      formattedConditionStep: "",
      mine_report_permit_requirement_id: report.mine_report_permit_requirement_id,
      regulatory_authority: report.cim_or_cpo ? REPORT_REGULATORY_AUTHORITY_CODES_HASH[report.cim_or_cpo] : "Not Specified",
      ministry_recipient: report.ministry_recipient?.map(
        (dest, index) =>
          `${REPORT_MINISTRY_RECIPIENT_HASH[dest]}${index < report.ministry_recipient.length - 1 ? ", " : ""} `
      ) ?? "None Specified",
      permit_condition_ids: report.permit_condition_ids,
      frequency: Object.keys(REPORT_FREQUENCY_HASH).find(key => REPORT_FREQUENCY_HASH[key] === report.due_date_period_months),
      initial_due_date: report.initial_due_date,
    }
  }
  return null;
}

export const inspectionOrderNumberSorter = (a, b, dataIndex) => {
  const getValue = (record) => {
    const keys = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
    return keys.reduce((obj, key) => obj?.[key], record);
  };

  const parseOrder = (order) => {
    const [main, sub] = (order ? order.split("-") : ["0", "0"]).map(Number);
    return [main, sub];
  };

  const [mainA, subA] = parseOrder(getValue(a));
  const [mainB, subB] = parseOrder(getValue(b));

  if (mainA !== mainB) return mainA - mainB;
  return subA - subB;
};

export const getLockedSystemNtrGuid = (documents) => {
  const qualifying = (documents || []).filter(
    (doc) =>
      doc.now_application_document_type_code === "NTR" &&
      doc.is_final_package &&
      doc.is_system_generated &&
      !doc.deleted_ind
  );
  if (!qualifying.length) return null;
  const sorted = [...qualifying].sort((a, b) => {
    const aDate = a.mine_document?.upload_date || "";
    const bDate = b.mine_document?.upload_date || "";
    return bDate > aDate ? 1 : -1;
  });
  return sorted[0]?.now_application_document_xref_guid || null;
};