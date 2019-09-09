// types/index.js
import * as CommonTypes from "@/customPropTypes/common";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";
import * as PartyTypes from "@/customPropTypes/parties";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as MinespaceTypes from "@/customPropTypes/minespace";
import * as VariancesTypes from "@/customPropTypes/variances";
import * as ApplicationTypes from "@/customPropTypes/applications";
import * as ComplianceTypes from "@/customPropTypes/compliance";
import * as IncidentTypes from "@/customPropTypes/incidents";
import * as ReportTypes from "@/customPropTypes/reports";
import * as NoticeOfWorkTypes from "@/customPropTypes/noticeOfWork";

export default {
  ...CommonTypes,
  ...MineTypes,
  ...PermitTypes,
  ...PartyTypes,
  ...DocumentTypes,
  ...MinespaceTypes,
  ...ApplicationTypes,
  ...ComplianceTypes,
  ...VariancesTypes,
  ...IncidentTypes,
  ...ReportTypes,
  ...NoticeOfWorkTypes,
};
