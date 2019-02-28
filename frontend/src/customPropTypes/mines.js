import { PropTypes, shape, arrayOf } from "prop-types";
import { permit } from "@/customPropTypes/permits";
import { mineExpectedDocument } from "@/customPropTypes/documents";
import { tailingsStorageFacility } from "@/customPropTypes/tailings";

export const mine = shape({
  guid: PropTypes.string.isRequired,
  mine_no: PropTypes.string,
  mine_name: PropTypes.string,
  mine_note: PropTypes.string,
  region_code: PropTypes.string,
  major_mine_ind: PropTypes.bool,
  mine_permit: arrayOf(permit),
  mine_expected_documents: arrayOf(mineExpectedDocument),
  mine_tailings_storage_facility: arrayOf(tailingsStorageFacility),
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
  guid: PropTypes.string.isRequired,
  mine_name: PropTypes.string.isRequired,
  mine_no: PropTypes.string.isRequired,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
});

export const mineComplianceInfo = shape({
  advisories: PropTypes.number.isRequired,
  inspector: PropTypes.string.isRequired,
  last_inspection: PropTypes.string.isRequired,
  num_open_orders: PropTypes.number.isRequired,
  num_overdue_orders: PropTypes.number.isRequired,
  open_orders: PropTypes.array,
  section_35_orders: PropTypes.number.isRequired,
  warnings: PropTypes.number.isRequired,
});
