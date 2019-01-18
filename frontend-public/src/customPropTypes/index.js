// types/index.js
import * as UserTypes from "@/customPropTypes/user";
import * as MineTypes from "@/customPropTypes/mines";
import * as PermitTypes from "@/customPropTypes/permits";
import * as DocumentTypes from "@/customPropTypes/documents";

export default {
  ...UserTypes,
  ...MineTypes,
  ...PermitTypes,
  ...DocumentTypes,
};
