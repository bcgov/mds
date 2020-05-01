import { PropTypes, shape, arrayOf } from "prop-types";
import { tailingsStorageFacility } from "@/customPropTypes/tailings";

export const mine = shape({
  mine_guid: PropTypes.string.isRequired,
  mine_no: PropTypes.string,
  mine_name: PropTypes.string,
  mine_note: PropTypes.string,
  mine_region: PropTypes.string,
  ohsc_ind: PropTypes.bool,
  union_ind: PropTypes.bool,
  major_mine_ind: PropTypes.bool,
  mine_permit_numbers: PropTypes.arrayOf(PropTypes.string),
  mine_tailings_storage_facilities: arrayOf(tailingsStorageFacility),
});

export const mineProfile = shape({
  latitude: PropTypes.string,
  longitude: PropTypes.string,
  major_mine_ind: PropTypes.bool,
  mine_name: PropTypes.string,
  mine_note: PropTypes.string,
  mine_region: PropTypes.string,
  mine_status: arrayOf(PropTypes.string),
  status_date: PropTypes.string,
});

export const mineTypes = shape({
  mine_tenure_type_code: PropTypes.string,
  mine_commodity_code: PropTypes.arrayOf(PropTypes.string),
  mine_disturbance_code: PropTypes.arrayOf(PropTypes.string),
});

export const transformedMineTypes = shape({
  mine_tenure_type_code: PropTypes.arrayOf(PropTypes.string),
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

export const mineComment = shape({
  mine_comment_guid: PropTypes.string.isRequired,
  comment_user: PropTypes.string.isRequired,
  mine_comment: PropTypes.string.isRequired,
  comment_datetime: PropTypes.string.isRequired,
});
