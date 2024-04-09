import * as CommonTypes from "@/customPropTypes/common";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";
import * as PartyTypes from "@/customPropTypes/parties";
import * as VarianceTypes from "@/customPropTypes/variances";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as ReportTypes from "@/customPropTypes/reports";
import * as ComplianceTypes from "@/customPropTypes/compliance";
import * as Incidents from "@/customPropTypes/incidents";
import * as Securities from "@/customPropTypes/securities";
import * as ProjectTypes from "@/customPropTypes/projects";
import * as EMLIContactTypes from "@/customPropTypes/EMLIContact";
import * as NoticeOfDepartureTypes from "@/customPropTypes/noticeOfDeparture";

export default {
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
  ...ProjectTypes,
  ...EMLIContactTypes,
  ...NoticeOfDepartureTypes,
};
