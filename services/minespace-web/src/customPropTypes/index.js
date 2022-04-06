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
import * as Securities from "@/customPropTypes/securities";
import * as ProjectSummaryTypes from "@/customPropTypes/projectSummaries";
import * as EMLIContactTypes from "@/customPropTypes/EMLIContact";
import * as NoticeOfDepartureTypes from "@/customPropTypes/noticeOfDeparture";

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
  ...Securities,
  ...ProjectSummaryTypes,
  ...EMLIContactTypes,
  ...NoticeOfDepartureTypes,
};
