import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import FileUpload from "./FileUpload";

/**
 * @constant RenderFileUpload  - FilePond `FileUpload` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  uploadUrl: PropTypes.string.isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
  onFileLoad: PropTypes.func,
  onRemoveFile: PropTypes.func,
  addFileStart: PropTypes.func,
  chunkSize: PropTypes.number,
  labelIdle: PropTypes.string,
  allowRevert: PropTypes.bool,
  allowMultiple: PropTypes.bool,
  onProcessFiles: PropTypes.func,
  onAbort: PropTypes.func,
};

const defaultProps = {
  label: "",
  placeholder: "",
  disabled: false,
  maxFileSize: "750MB",
  acceptedFileTypesMap: {},
  onFileLoad: () => {},
  onRemoveFile: () => {},
  addFileStart: () => {},
  chunkSize: 1048576, // 1MB
  allowRevert: false,
  allowMultiple: true,
  onProcessFiles: () => {},
  onAbort: () => {},
  labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
};

const RenderFileUpload = (props) => (
  <Form.Item
    label={props.label}
    validateStatus={
      props.meta.touched ? (props.meta.error && "error") || (props.meta.warning && "warning") : ""
    }
    help={
      props.meta.touched &&
      ((props.meta.error && <span>{props.meta.error}</span>) ||
        (props.meta.warning && <span>{props.meta.warning}</span>))
    }
  >
    <FileUpload {...props} />
  </Form.Item>
);

RenderFileUpload.propTypes = propTypes;
RenderFileUpload.defaultProps = defaultProps;

export default RenderFileUpload;
