import { PropTypes, shape } from "prop-types";

export const incident = shape({
  mine_incident_guid: PropTypes.string,
  mine_incident_report_no: PropTypes.string,
  mine_incident_id_year: PropTypes.number,
  mine_guid: PropTypes.string,
  incident_timestamp: PropTypes.string,
  incident_description: PropTypes.string,
  reported_timestamp: PropTypes.string,
  reported_by: PropTypes.string,
  reported_by_role: PropTypes.string,
  followup_type_code: PropTypes.string,
  followup_inspection_no: PropTypes.string,
  closing_report_summary: PropTypes.string,
  mms_inspector_initials: PropTypes.string,
});

export const incidentPageData = shape({
  records: PropTypes.arrayOf(incident),
  current_page: PropTypes.number,
  items_per_page: PropTypes.number,
  total: PropTypes.number,
  total_pages: PropTypes.number,
});

export default incident;
