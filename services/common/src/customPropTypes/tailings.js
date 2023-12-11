import { PropTypes, shape } from "prop-types";

export const tailingsStorageFacility = shape({
  mine_guid: PropTypes.string.isRequired,
  mine_tailings_storage_facility_guid: PropTypes.string.isRequired,
  mine_tailings_storage_facility_name: PropTypes.string.isRequired,
});

export default tailingsStorageFacility;
