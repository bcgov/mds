// types/index.js
import * as CommonTypes from "@/customPropTypes/common";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";
import * as PartyTypes from "@/customPropTypes/parties";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as MinespaceTypes from "@/customPropTypes/minespace";
import * as ApplicationTypes from "@/customPropTypes/applications";
import * as ComplianceTypes from "@/customPropTypes/compliance";

export default {
  ...CommonTypes,
  ...MineTypes,
  ...PermitTypes,
  ...PartyTypes,
  ...DocumentTypes,
  ...MinespaceTypes,
  ...ApplicationTypes,
  ...ComplianceTypes,
};
