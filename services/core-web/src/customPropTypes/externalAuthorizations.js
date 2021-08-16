import { PropTypes } from "prop-types";

export const project = PropTypes.shape({
  project_id: PropTypes.string,
  project_legislation_year: PropTypes.number,
  project_lead: PropTypes.string,
  project_lead_email: PropTypes.string,
  project_lead_phone: PropTypes.string,
  responsible_EPD: PropTypes.string,
  responsible_EPD_email: PropTypes.string,
  responsible_EPD_phone: PropTypes.string,
  link: PropTypes.string,
});

export const mineInfo = PropTypes.shape({
  mine_guid: PropTypes.string,
  summary: PropTypes.string,
  projects: PropTypes.arrayOf(project),
});
