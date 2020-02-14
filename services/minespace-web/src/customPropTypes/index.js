import * as CommonTypes from "@/customPropTypes/common";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";
import * as PartyTypes from "@/customPropTypes/parties";
import * as VarianceTypes from "@/customPropTypes/variances";
import * as UserTypes from "@/customPropTypes/user";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as ReportTypes from "@/customPropTypes/reports";
import * as ComplianceTypes from "@/customPropTypes/compliance";
import * as Incidents from "@/customPropTypes/incidents";

export default {
  ...UserTypes,
  ...MineTypes,
  ...PermitTypes,
  ...PartyTypes,
  ...VarianceTypes,
  ...DocumentTypes,
  ...CommonTypes,
  ...ReportTypes,
  ...ComplianceTypes,
  ...Incidents,
};
