import { PropTypes, shape } from "prop-types";

export const mineDocument = shape({
  mine_document_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string,
  document_manager_guid: PropTypes.string,
  document_name: PropTypes.string,
  active_ind: PropTypes.string,
});

export const documentRecord = shape({
  key: PropTypes.string.isRequired,
  mine_document_guid: PropTypes.string.isRequired,
  document_manager_guid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  uploaded: PropTypes.string.isRequired,
});
