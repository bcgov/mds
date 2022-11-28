import React from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import FileUpload from "./FileUpload";

/**
 * @constant RenderDate  - Ant Design `DatePicker` component for redux-form.
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
  onAbort: PropTypes.func,
  onRemoveFile: PropTypes.func,
  addFileStart: PropTypes.func,
  chunkSize: PropTypes.number,
  allowRevert: PropTypes.bool,
  allowMultiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  afterSuccess: PropTypes.shape({
    action: PropTypes.func,
    projectGuid: PropTypes.string,
    irtGuid: PropTypes.string,
  }),
  labelIdle: PropTypes.string,
  onprocessfiles: PropTypes.func,
  importIsSuccessful: PropTypes.func,
  beforeAddFile: PropTypes.func,
  beforeDropFile: PropTypes.func,
};

const defaultProps = {
  maxFileSize: "750MB",
  acceptedFileTypesMap: {},
  onFileLoad: () => {},
  onAbort: () => {},
  onRemoveFile: () => {},
  addFileStart: () => {},
  chunkSize: 1048576, // 1MB
  allowRevert: false,
  allowMultiple: true,
  maxFiles: null,
  label: "",
  placeholder: "",
  disabled: false,
  afterSuccess: null,
  onprocessfiles: () => {},
  importIsSuccessful: () => {},
  labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  beforeAddFile: () => {},
  beforeDropFile: () => {},
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
