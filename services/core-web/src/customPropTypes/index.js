// types/index.js
import * as CommonTypes from "@/customPropTypes/common";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";
import * as PartyTypes from "@/customPropTypes/parties";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as MinespaceTypes from "@/customPropTypes/minespace";
import * as VariancesTypes from "@/customPropTypes/variances";
import * as ComplianceTypes from "@/customPropTypes/compliance";
import * as IncidentTypes from "@/customPropTypes/incidents";
import * as ReportTypes from "@/customPropTypes/reports";
import * as NoticeOfWorkTypes from "@/customPropTypes/noticeOfWork";
import * as NoticeOfWorkPageFromRouteTypes from "@/customPropTypes/noticeOfWorkPageFromRoute";
import * as securities from "@/customPropTypes/securities";

export default {
  ...CommonTypes,
  ...MineTypes,
  ...PermitTypes,
  ...PartyTypes,
  ...DocumentTypes,
  ...MinespaceTypes,
  ...ComplianceTypes,
  ...VariancesTypes,
  ...IncidentTypes,
  ...ReportTypes,
  ...NoticeOfWorkTypes,
  ...NoticeOfWorkPageFromRouteTypes,
  ...securities,
};
