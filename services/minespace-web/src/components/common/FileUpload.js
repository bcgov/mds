/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import { notification } from "antd";
import { invert, uniq } from "lodash";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import tus from "tus-js-client";
import { ENVIRONMENT } from "@common/constants/environment";
import { APPLICATION_OCTET_STREAM } from "@/constants/fileTypes";
import { createRequestHeader } from "@common/utils/RequestHeaders";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
  onFileLoad: PropTypes.func,
  onRemoveFile: PropTypes.func,
  addFileStart: PropTypes.func,
  chunkSize: PropTypes.number,
  allowRevert: PropTypes.bool,
  allowMultiple: PropTypes.bool,
};

const defaultProps = {
  maxFileSize: "750MB",
  acceptedFileTypesMap: {},
  onFileLoad: () => {},
  onRemoveFile: () => {},
  addFileStart: () => {},
  chunkSize: 1048576, // 1MB
  allowRevert: false,
  allowMultiple: true,
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
            filetype: file.type || APPLICATION_OCTET_STREAM,
          },
          headers: createRequestHeader().headers,
          onError: (err) => {
            notification.error({
              message: `Failed to upload ${file.name}: ${err}`,
              duration: 10,
            });
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
    const fileValidateTypeLabelExpectedTypesMap = invert(this.props.acceptedFileTypesMap);
    const acceptedFileTypes = uniq(Object.values(this.props.acceptedFileTypesMap));

    return (
      <div>
        <FilePond
          server={this.server}
          name="file"
          allowRevert={this.props.allowRevert}
          onremovefile={this.props.onRemoveFile}
          allowMultiple={this.props.allowMultiple}
          onaddfilestart={this.props.addFileStart}
          maxFileSize={this.props.maxFileSize}
          allowFileTypeValidation={acceptedFileTypes.length > 0}
          acceptedFileTypes={acceptedFileTypes}
          fileValidateTypeLabelExpectedTypesMap={fileValidateTypeLabelExpectedTypesMap}
          fileValidateTypeDetectType={(source, type) =>
            new Promise((resolve, reject) => {
              // If the browser can't automatically detect the file's MIME type, use the one stored in the "accepted file types" map.
              if (!type) {
                const exts = source.name.split(".");
                const ext = exts && exts.length > 0 && `.${exts.pop()}`;
                if (ext && ext in this.props.acceptedFileTypesMap) {
                  type = this.props.acceptedFileTypesMap[ext];
                } else {
                  reject(type);
                }
              }
              resolve(type);
            })
          }
        />
      </div>
    );
  }
}

FileUpload.propTypes = propTypes;
FileUpload.defaultProps = defaultProps;

export default FileUpload;
