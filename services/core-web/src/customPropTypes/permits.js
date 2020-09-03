import { PropTypes, shape, arrayOf } from "prop-types";

export const permitAmendment = shape({
  permit_amendment_id: PropTypes.number,
  permit_amendment_guid: PropTypes.string,
  permit_amendment_status_code: PropTypes.string,
  permit_amendment_type_code: PropTypes.string,
  received_date: PropTypes.string,
  issue_date: PropTypes.string,
  authorization_end_date: PropTypes.string,
  security_adjustment: PropTypes.number,
});

export const permit = shape({
  permit_guid: PropTypes.string,
  permit_no: PropTypes.string,
  permit_status_code: PropTypes.string,
  amendments: arrayOf(permitAmendment),
  current_permittee: PropTypes.string,
});

export const permitGenObj = shape({
  permit_number: PropTypes.string,
  issue_date: PropTypes.string,
  auth_end_date: PropTypes.string,
  regional_office: PropTypes.string,
  current_date: PropTypes.string,
  current_month: PropTypes.string,
  current_year: PropTypes.string,
  conditions: PropTypes.string,
  lead_inspector: PropTypes.string,
  lead_inspector_title: PropTypes.string,
  permittee: PropTypes.string,
  permittee_email: PropTypes.string,
  property: PropTypes.string,
  original_permit_issue_date: PropTypes.string,
  application_type: PropTypes.string,
  notice_of_work_type_code: PropTypes.string,
  mine_no: PropTypes.string,
});

export const preDraftForm = shape({
  is_exploration: PropTypes.bool,
  permit_guid: PropTypes.string,
});
