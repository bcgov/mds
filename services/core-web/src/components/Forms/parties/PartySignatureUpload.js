import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import React, { useState } from "react";
import PropTypes from "prop-types";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileEncode from "filepond-plugin-file-encode";
import FilePondPluginGetFile from "filepond-plugin-get-file";
import { IMAGE } from "@/constants/fileTypes";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond-plugin-get-file/dist/filepond-plugin-get-file.css";

const propTypes = {
  signature: PropTypes.string,
  onFileChange: PropTypes.func.isRequired,
};

const defaultProps = {
  signature: undefined,
};

registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileEncode,
  FilePondPluginGetFile
);

export const PartySignatureUpload = (props) => {
  const [files, setFiles] = useState([]);

  return (
    <Form.Item>
      <FilePond
        files={props.signature ? [props.signature] : files}
        allowImagePreview
        allowRevert
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        acceptedFileTypes={Object.values(IMAGE)}
        onupdatefiles={(fileItems) => {
          const item = fileItems && fileItems[0];
          props.onFileChange(item ? item.getFileEncodeDataURL() : null);
          setFiles(fileItems);
        }}
        labelButtonDownloadItem="Download signature"
        maxFileSize="350KB"
        minFileSize="6KB"
      />
    </Form.Item>
  );
};
PartySignatureUpload.propTypes = propTypes;
PartySignatureUpload.defaultProps = defaultProps;

export default PartySignatureUpload;
