// types/index.js
import * as CommonTypes from "@/customPropTypes/common";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";

export default {
  ...CommonTypes,
  ...MineTypes,
  ...PermitTypes,
};
