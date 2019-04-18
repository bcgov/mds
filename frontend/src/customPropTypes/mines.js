import { PropTypes, shape, arrayOf } from "prop-types";
import { permit } from "@/customPropTypes/permits";
import { mineExpectedDocument } from "@/customPropTypes/documents";
import { tailingsStorageFacility } from "@/customPropTypes/tailings";

export const mine = shape({
  mine_guid: PropTypes.string.isRequired,
  mine_no: PropTypes.string,
  mine_name: PropTypes.string,
  mine_note: PropTypes.string,
  mine_region: PropTypes.string,
  major_mine_ind: PropTypes.bool,
  mine_permit: arrayOf(permit),
  mine_expected_documents: arrayOf(mineExpectedDocument),
  mine_tailings_storage_facilities: arrayOf(tailingsStorageFacility),
});

export const mineTypes = shape({
  mine_tenure_type_code: PropTypes.string,
  mine_commodity_code: PropTypes.arrayOf(PropTypes.string),
  mine_disturbance_code: PropTypes.arrayOf(PropTypes.string),
});

export const minePageData = shape({
  current_page: PropTypes.number,
  items_per_page: PropTypes.number,
  mines: PropTypes.arrayOf(mine),
  total: PropTypes.number,
  total_pages: PropTypes.number,
});

export const mineName = shape({
  mine_guid: PropTypes.string.isRequired,
  mine_name: PropTypes.string.isRequired,
  mine_no: PropTypes.string.isRequired,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
});

export const mineVerificationStatus = shape({
  mine_guid: PropTypes.string.isRequired,
  mine_name: PropTypes.string.isRequired,
  healthy_ind: PropTypes.bool.isRequired,
  verifying_user: PropTypes.string.isRequired,
  verifying_timestamp: PropTypes.string.isRequired,
});
