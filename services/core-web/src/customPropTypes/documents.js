import { PropTypes, shape } from "prop-types";

export const mineDocument = shape({
  mine_document_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string,
  document_manager_guid: PropTypes.string,
  document_name: PropTypes.string,
  active_ind: PropTypes.string,
  is_archived: PropTypes.bool,
});

export const documentRecord = shape({
  key: PropTypes.string.isRequired,
  mine_document_guid: PropTypes.string.isRequired,
  document_manager_guid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  uploaded: PropTypes.string.isRequired,
  update_timestamp: PropTypes.string.isRequired,
});

export const documentDownloadState = PropTypes.shape({
  downloading: PropTypes.bool.isRequired,
  currentFile: PropTypes.number.isRequired,
  totalFiles: PropTypes.number.isRequired,
}).isRequired;

export const documentFormSpecField = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  "context-value": PropTypes.string,
  "read-only": PropTypes.string,
}).isRequired;
