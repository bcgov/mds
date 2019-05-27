// types/index.js
import * as UserTypes from "@/customPropTypes/user";
import * as MineTypes from "@/customPropTypes/mines";
import * as VarianceTypes from "@/customPropTypes/variances";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as CommonTypes from "@/customPropTypes/common";

export default {
  ...UserTypes,
  ...MineTypes,
  ...VarianceTypes,
  ...DocumentTypes,
  ...CommonTypes,
};
