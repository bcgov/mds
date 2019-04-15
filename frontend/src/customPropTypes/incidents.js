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
});

export const incidentFollowupType = shape({
  mine_incident_followup_type_code: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  display_order: PropTypes.number.isRequired,
  active_ind: PropTypes.bool.isRequired,
});

export default incident;
