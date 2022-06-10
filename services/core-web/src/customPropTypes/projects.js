import { PropTypes } from "prop-types";
import { mineDocument } from "./documents";

export const irt_requirements_xref = PropTypes.shape({
  irt_requirements_xref_guid: PropTypes.string,
  requirement_guid: PropTypes.string,
  deleted_ind: PropTypes.boolean,
  comment: PropTypes.string,
  methods: PropTypes.boolean,
  required: PropTypes.boolean,
});

export const informationRequirementsTable = PropTypes.shape({
  information_requirements_table_guid: PropTypes.string,
  information_requirements_table_id: PropTypes.number,
  project_guid: PropTypes.string,
  requirements: PropTypes.arrayOf(irt_requirements_xref),
  status_code: PropTypes.string,
});

export const projectSummary = PropTypes.shape({
  project_summary_id: PropTypes.number,
  project_summary_guid: PropTypes.string,
  status_code: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});

export const projectContact = PropTypes.shape({
  project_guid: PropTypes.string,
  project_contact_guid: PropTypes.string,
  name: PropTypes.string,
  phone_number: PropTypes.string,
  email: PropTypes.string,
  job_title: PropTypes.string,
  phone_extension: PropTypes.string,
  company_name: PropTypes.string,
  is_primary: PropTypes.boolean,
});

export const project = PropTypes.shape({
  project_id: PropTypes.number,
  project_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  project_title: PropTypes.string,
  project_summary: projectSummary,
  information_requirements_table: informationRequirementsTable,
  contacts: PropTypes.arrayOf(PropTypes.shape(projectContact)),
});

export const subRequirements = PropTypes.shape({
  comment: PropTypes.string,
  methods: PropTypes.boolean,
  required: PropTypes.boolean,
  deleted_ind: PropTypes.boolean,
  description: PropTypes.string,
  display_order: PropTypes.number,
  parent_requirement_id: PropTypes.number,
  requirement_guid: PropTypes.string,
  requirement_id: PropTypes.number,
  step: PropTypes.string,
});

export const requirements = PropTypes.shape({
  deleted_ind: PropTypes.boolean,
  description: PropTypes.string,
  display_order: PropTypes.number,
  parent_requirement_id: PropTypes.number,
  requirement_guid: PropTypes.string,
  requirement_id: PropTypes.number,
  step: PropTypes.string,
  sub_requirements: PropTypes.arrayOf(subRequirements),
});
