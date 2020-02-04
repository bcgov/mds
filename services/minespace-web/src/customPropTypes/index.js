// types/index.js
import * as UserTypes from "@/customPropTypes/user";
import * as MineTypes from "@/customPropTypes/mines";
import * as VarianceTypes from "@/customPropTypes/variances";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as CommonTypes from "@/customPropTypes/common";
import * as ReportTypes from "@/customPropTypes/reports";
import * as ComplianceTypes from "@/customPropTypes/compliance";

export default {
  ...UserTypes,
  ...MineTypes,
  ...VarianceTypes,
  ...DocumentTypes,
  ...CommonTypes,
  ...ReportTypes,
  ...ComplianceTypes,
};
