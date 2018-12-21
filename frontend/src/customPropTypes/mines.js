import { PropTypes, shape, arrayOf } from "prop-types";
import { minePermit } from "@/customPropTypes/permits";

export const mine = shape({
  guid: PropTypes.string.isRequired,
  mine_permit: arrayOf(minePermit),
});
