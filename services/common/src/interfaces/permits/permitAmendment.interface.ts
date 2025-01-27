import { VC_CRED_ISSUE_STATES } from "@mds/common/constants/enums";
import { INoWDocument } from "../NoWDocument.interface";
import { INoWImportedApplicationDocument } from "../NoWImportedApplicationDocument.interface";
import { IMineReportPermitRequirement } from "./mineReportPermitRequirements.interface";
import { IPermitAmendmentDocument } from "./permitAmendmentDocument.interface";
import { IPermitCondition, IPermitConditionCategory } from "./permitCondition.interface";

export interface IPermitAmendment {
  permit_amendment_id: number;
  permit_no: string;
  permit_amendment_guid: string;
  permit_amendment_status_code: string;
  permit_amendment_type_code: string;
  received_date: string;
  issue_date: string;
  authorization_end_date: string;
  liability_adjustment: number;
  security_received_date: string;
  security_not_required: boolean;
  security_not_required_reason: string;
  description: string;
  issuing_inspector_title: string;
  regional_office: string;
  now_application_guid: string;
  now_application_documents: INoWDocument[];
  imported_now_application_documents: INoWImportedApplicationDocument[];
  related_documents: IPermitAmendmentDocument[];
  permit_conditions_last_updated_by: string;
  permit_conditions_last_updated_date: string;
  has_permit_conditions: boolean;
  conditions: IPermitCondition[];
  is_generated_in_core: boolean;
  preamble_text: string;
  vc_credential_exch_state: VC_CRED_ISSUE_STATES;
  mine_report_permit_requirements?: IMineReportPermitRequirement[];
  condition_categories: IPermitConditionCategory[];
  conditions_review_completed: boolean;
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
      const req = requirementsByCondition[condition.permit_condition_id];
      result = [...result, ...(req || [])];
    } else if (condition?.mineReportPermitRequirement) {
      result.push(condition);
    }

    if (condition?.sub_conditions && condition?.sub_conditions.length > 0) {
      result = result.concat(getConditionsWithRequirements(condition.sub_conditions));
    }
  });

  return result;
};