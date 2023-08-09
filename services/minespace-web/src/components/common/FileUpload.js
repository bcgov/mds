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
import * as tus from "tus-js-client";
import { ENVIRONMENT } from "@mds/common";
import { APPLICATION_OCTET_STREAM } from "@common/constants/fileTypes";
import { createRequestHeader } from "@common/utils/RequestHeaders";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const propTypes = {
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
  allowReorder: PropTypes.bool,
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
  itemInsertLocation: PropTypes.func | PropTypes.string,
  notificationDisabledStatusCodes: PropTypes.arrayOf(PropTypes.number),
  shouldReplaceFile: PropTypes.bool,
  replaceFileUploadUrl: PropTypes.string,
  file: PropTypes.object,
  shouldAbortUpload: PropTypes.bool,
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
  afterSuccess: null,
  onprocessfiles: () => {},
  importIsSuccessful: () => {},
  labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  beforeAddFile: () => {},
  beforeDropFile: () => {},
  itemInsertLocation: "before",
  notificationDisabledStatusCodes: [],
  shouldReplaceFile: false,
  replaceFileUploadUrl: "",
  file: null,
  shouldAbortUpload: false,
};

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null,
    };

    this.server = {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        if (file) {
          this.setState({ file: file, progress: progress, load: load });
        }
        const fileToUpload = this.state.file ? this.state.file : file;
        const progressFn = this.state.progress ? this.state.progress : progress;
        const loadFn = this.state.load ? this.state.load : load;

        const upload = new tus.Upload(fileToUpload, {
          endpoint: ENVIRONMENT.apiUrl + this.props.uploadUrl,
          retryDelays: [100, 1000, 3000],
          removeFingerprintOnSuccess: true,
          chunkSize: this.props.chunkSize,
          metadata: {
            filename: fileToUpload.name,
            filetype: fileToUpload.type || APPLICATION_OCTET_STREAM,
          },
          onBeforeRequest: (req) => {
            // Set authorization header on each request to make use
            // of the new token in case of a token refresh was performed
            var xhr = req.getUnderlyingObject();
            const { headers } = createRequestHeader();

            xhr.setRequestHeader("Authorization", headers.Authorization);
          },
          onError: (err) => {
            try {
              err.response = JSON.parse(err.originalRequest.response);
              err.originalRequest = err.originalRequest;

              if (
                !(
                  this.props.notificationDisabledStatusCodes.length &&
                  this.props.notificationDisabledStatusCodes.includes(err.response.status_code)
                )
              ) {
                notification.error({
                  message: `Failed to upload ${
                    file && fileToUpload.name ? fileToUpload.name : ""
                  }: ${err}`,
                  duration: 10,
                });
              }
              if (this.props.onError) {
                this.props.onError(file && fileToUpload.name ? fileToUpload.name : "", err);
              }
            } catch (err) {
              notification.error({
                message: `Failed to upload the file: ${err}`,
                duration: 10,
              });
            }
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            progressFn(true, bytesUploaded, bytesTotal);
          },
          onSuccess: async () => {
            const documentGuid = upload.url.split("/").pop();
            loadFn(documentGuid);
            this.props.onFileLoad(fileToUpload.name, documentGuid);
            // Call an additional action on file blob after success(only one use case so far, may need to be extended/structured better in the future)
            if (this.props?.afterSuccess?.action) {
              try {
                if (this.props.afterSuccess?.irtGuid) {
                  await this.props.afterSuccess.action[1](
                    this.props.afterSuccess?.projectGuid,
                    this.props.afterSuccess?.irtGuid,
                    file,
                    documentGuid
                  );
                } else {
                  await this.props.afterSuccess.action[0](
                    this.props.afterSuccess?.projectGuid,
                    file,
                    documentGuid
                  );
                }
                this.props.importIsSuccessful(true);
              } catch (err) {
                this.props.importIsSuccessful(false, err);
              }
            }
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

  componentDidUpdate(prevProps) {
    if (prevProps.shouldReplaceFile !== this.props.shouldReplaceFile) {
      this.props.uploadUrl = this.props.replaceFileUploadUrl;
      this.server.process();
    }
    if (prevProps.shouldAbortUpload !== this.props.shouldAbortUpload) {
      if (this.props.shouldAbortUpload) {
        this.filepond.removeFile();
      }
    }
  }

  render() {
    const fileValidateTypeLabelExpectedTypesMap = invert(this.props.acceptedFileTypesMap);
    const acceptedFileTypes = uniq(Object.values(this.props.acceptedFileTypesMap));

    return (
      <div>
        <FilePond
          ref={(ref) => (this.filepond = ref)}
          beforeAddFile={this.props.beforeAddFile}
          beforeDropFile={this.props.beforeDropFile}
          server={this.server}
          name="file"
          maxFiles={this.props.maxFiles}
          allowRevert={this.props.allowRevert}
          onremovefile={this.props.onRemoveFile}
          allowMultiple={this.props.allowMultiple}
          onaddfilestart={this.props.addFileStart}
          onprocessfiles={this.props.onprocessfiles}
          allowReorder={this.props.allowReorder}
          labelIdle={this.props.labelIdle}
          onprocessfileabort={this.props.onAbort}
          maxFileSize={this.props.maxFileSize}
          allowFileTypeValidation={acceptedFileTypes.length > 0}
          acceptedFileTypes={acceptedFileTypes}
          itemInsertLocation={this.props?.itemInsertLocation}
          credits={null}
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
