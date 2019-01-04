import { PropTypes, shape, arrayOf } from "prop-types";
import { minePermit } from "@/customPropTypes/permits";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const mine = shape({
  guid: PropTypes.string.isRequired,
  mine_permit: arrayOf(minePermit),
});

export const mineTypes = shape({
  mine_tenure_type_code: PropTypes.string,
  mine_commodity_code: PropTypes.arrayOf(PropTypes.string),
  mine_disturbance_code: PropTypes.arrayOf(PropTypes.string),
});

export const minePageData = shape({
  current_page: PropTypes.numnber,
  items_per_page: PropTypes.numnber,
  mines: PropTypes.arrayOf(mine),
  total: PropTypes.numnber,
  total_pages: PropTypes.numnber,
});
