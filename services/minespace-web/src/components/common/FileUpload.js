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
  onFileReplace: PropTypes.func,
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
  onFileReplace: () => {},
};

class FileUpload extends React.Component {
  constructor(props) {
    console.log(">>>>>>>>>>>>>>>>>CONSTRUCTOR");
    super(props);
    this.pondRef = React.createRef();

    this.server = {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        console.log(">>>>>>>>>>>>>>>>>CONSTRUCTOR 73");
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
            console.log(">>>>>>>>>>>>>>>>>CONSTRUCTOR 86", err.originalRequest.response);
            err.response = JSON.parse(err.originalRequest.response);
            err.originalRequest = err.originalRequest;

            console.log("FILE_UPLOAD - err.response.status_code : ", err.response.status_code);
            console.log(
              "FILE_UPLOAD - this.props.notificationDisabledStatusCodes : ",
              this.props.notificationDisabledStatusCodes
            );

            if (
              !(
                this.props.notificationDisabledStatusCodes.length &&
                this.props.notificationDisabledStatusCodes.includes(err.response.status_code)
              )
            ) {
              console.log("Notifications enbaled....");
              notification.error({
                message: `Failed to upload ${file.name}: ${err}`,
                duration: 10,
              });
            } else {
              // remove else
              console.log("notification disabled\n", this.props.notificationDisabledStatusCodes);
            }

            this.props.onError(file.name, err);
            error(err);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            console.log(">>>>>>>>>>>>>>>>>CONSTRUCTOR 108");
            progress(true, bytesUploaded, bytesTotal);
          },
          onSuccess: async () => {
            console.log(">>>>>>>>>  >>>>>>>>CONSTRUCTOR 112");
            const documentGuid = upload.url.split("/").pop();
            load(documentGuid);
            this.props.onFileLoad(file.name, documentGuid);
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
        console.log(">>>>>>>>>>>>>>>>>CONSTRUCTOR 141");
        return {
          abort: () => {
            console.log(">>>>>>>>>>>>>>>>>CONSTRUCTOR 144");
            upload.abort();
            abort();
          },
        };
      },
    };
  }

  childFunction = () => {
    console.log("C-___________________________________hild function is called!");
  };

  startFileUpload = () => {
    console.log(".............STARTFILEUPLOAD");
    // const inputRef = this.inputRef;
    // inputRef.current.click(); // This will trigger the file input click event to open the file dialog
  };

  render() {
    const fileValidateTypeLabelExpectedTypesMap = invert(this.props.acceptedFileTypesMap);
    const acceptedFileTypes = uniq(Object.values(this.props.acceptedFileTypesMap));

    return (
      <div>
        <FilePond
          ref={this.pondRef}
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
          onFileReplace={this.server.process.start}
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
