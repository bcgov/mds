import { PropTypes, shape } from "prop-types";

// eslint-disable-next-line import/prefer-default-export
export const mineDocument = shape({
  mine_document_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string,
  document_manager_guid: PropTypes.string,
  document_name: PropTypes.string,
  active_ind: PropTypes.boolean,
});
