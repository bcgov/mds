import { PropTypes, shape, arrayOf } from "prop-types";
import { minePermit } from "@/customPropTypes/permits";
import { mineExpectedDocument } from "@/customPropTypes/documents";

export const mine = shape({
  guid: PropTypes.string.isRequired,
  mine_no: PropTypes.string,
  mine_name: PropTypes.string,
  mine_note: PropTypes.string,
  region_code: PropTypes.string,
  major_mine_ind: PropTypes.bool,
  mine_permit: arrayOf(minePermit),
  mine_expected_documents: arrayOf(mineExpectedDocument),
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

export const mineName = shape({
  guid: PropTypes.string.isRequired,
  mine_name: PropTypes.string.isRequired,
  mine_no: PropTypes.string.isRequired,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
});
