import { map } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import "filepond-polyfill";
import { FilePond, File, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import tus from "tus-js-client";
import { ENVIRONMENT } from "@common/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
  onFileLoad: PropTypes.func,
  onRemoveFile: PropTypes.func,
  allowRevert: PropTypes.bool,
  chunkSize: PropTypes.number,
};

const defaultProps = {
  maxFileSize: "750MB",
  acceptedFileTypesMap: {},
  allowRevert: false,
  onFileLoad: () => { },
  onRemoveFile: () => { },
  chunkSize: 1048576, // 1MB
};

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.server = {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        const upload = new tus.Upload(file, {
          endpoint: ENVIRONMENT.apiUrl + this.props.uploadUrl,
          retryDelays: [100, 1000, 3000],
          removeFingerprintOnSuccess: true,
          chunkSize: this.props.chunkSize,
          metadata: {
            filename: file.name,
          },
          headers: createRequestHeader().headers,
          onError: (err) => {
            error(err);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            progress(true, bytesUploaded, bytesTotal);
          },
          onSuccess: () => {
            const documentGuid = upload.url.split("/").pop();
            load(documentGuid);
            this.props.onFileLoad(file.name, documentGuid);
          },
        });
        // Start the upload
        upload.start();
        return {
          abort: () => {
            upload.abort();
            abort();
          },
        };
      },
    };
  }

  render() {
    const acceptedFileTypes = Object.keys(this.props.acceptedFileTypesMap);

    return (
      <FilePond
        server={this.server}
        name="file"
        allowRevert={this.props.allowRevert}
        onremovefile={this.props.onRemoveFile}
        allowMultiple
        maxFileSize={this.props.maxFileSize}
        allowFileTypeValidation={acceptedFileTypes.length > 0}
        acceptedFileTypes={acceptedFileTypes}
        fileValidateTypeLabelExpectedTypesMap={this.props.acceptedFileTypesMap}
      />
    );
  }
}

FileUpload.propTypes = propTypes;
FileUpload.defaultProps = defaultProps;

export default FileUpload;
