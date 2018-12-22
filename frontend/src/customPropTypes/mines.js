import { PropTypes, shape, arrayOf } from "prop-types";
import { minePermit } from "@/customPropTypes/permits";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const mine = shape({
  guid: PropTypes.string.isRequired,
  mine_permit: arrayOf(minePermit),
});
