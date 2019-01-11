// types/index.js
import * as CommonTypes from "@/customPropTypes/common";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";
import * as PartyTypes from "@/customPropTypes/parties";

export default {
  ...CommonTypes,
  ...MineTypes,
  ...PermitTypes,
  ...PartyTypes,
};
