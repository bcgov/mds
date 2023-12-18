import React from "react";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import { notification } from "antd";
import { invert, uniq } from "lodash";
// import FunnelPlotOutlined from "@ant-design/icons/FunnelPlotOutlined";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import * as tus from "tus-js-client";
import { ENVIRONMENT } from "@mds/common";
import { APPLICATION_OCTET_STREAM } from "@mds/common/constants/fileTypes";
// import { FLUSH_SOUND, WATER_SOUND } from "@mds/common/constants/assets";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { pollDocumentUploadStatus } from "@mds/common/redux/actionCreators/documentActionCreator";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

interface FileUploadProps {
  uploadUrl: string;
  maxFileSize: string;
  acceptedFileTypesMap: string[];
  onFileLoad: (name, documentGuid) => void;
  onRemoveFile: (error, file) => void;
  addFileStart: (file) => void;
  chunkSize: number;
  labelIdle: string;
  allowRevert: boolean;
  allowMultiple: boolean;
  allowReorder: boolean;
  onProcessFiles: () => void;
  onAbort: (file) => void;
  itemInsertLocation: ((a, b) => number) | "before" | "after";
  onAfterResponse: () => void;
  beforeAddFile: (item) => boolean | Promise<boolean>;
  beforeDropFile: (file) => boolean;
}

const defaultProps = {
  maxFileSize: "750MB",
  acceptedFileTypesMap: [],
  onFileLoad: () => {},
  onRemoveFile: () => {},
  addFileStart: () => {},
  chunkSize: 1048576, // 1MB
  allowRevert: false,
  allowMultiple: true,
  allowReorder: false,
  onProcessFiles: () => {},
  onAbort: () => {},
  itemInsertLocation: "before",
  labelIdle:
    '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br> \
  <div>Accepted filetypes: .kmz, .doc, .docx, .xlsx, .pdf</div>',
  onAfterResponse: () => {},
  beforeAddFile: () => {},
  beforeDropFile: () => {},
};

interface FileUploadState {
  showWhirlpool: boolean;
  play: boolean;
}

class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
  static defaultProps: Partial<FileUploadProps>;
  server;
  flushSound;
  waterSound;

  constructor(props) {
    super(props);
    this.state = { showWhirlpool: false, play: false };

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
          onBeforeRequest: (req) => {
            // Set authorization header on each request to make use
            // of the new token in case of a token refresh was performed

            // (I am not sure why we are using var here, not touching it)
            // eslint-disable-next-line no-var
            var xhr = req.getUnderlyingObject();
            const { headers } = createRequestHeader();

            xhr.setRequestHeader("Authorization", headers.Authorization);
          },
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
          onAfterResponse: this.props.onAfterResponse,
          onSuccess: () => {
            const documentGuid = upload.url.split("/").pop();

            const pollUploadStatus = async () => {
              const response = await props.pollDocumentUploadStatus(documentGuid);
              if (response.data.status !== "In Progress") {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                clearInterval(intervalId);
                if (response.data.status === "Success") {
                  load(documentGuid);
                  this.props.onFileLoad(file.name, documentGuid);
                  if (this.state.showWhirlpool) {
                    this.flushSound.play();
                  }
                } else {
                  notification.error({
                    message: `Failed to upload ${file && file.name ? file.name : ""}: ${
                      response.data.status
                    }`,
                    duration: 10,
                  });

                  abort();
                }
              }
            };
            const intervalId = setInterval(pollUploadStatus, 1000);
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

  componentWillUnmount() {
    if (this.flushSound) {
      this.flushSound.removeEventListener("ended", () => this.setState({ play: false }));
    }
  }

  render() {
    const fileValidateTypeLabelExpectedTypesMap = invert(this.props.acceptedFileTypesMap);
    const acceptedFileTypes = uniq(Object.values(this.props.acceptedFileTypesMap));

    return (
      <div
        className={
          this.state.showWhirlpool ? "whirlpool-container whirlpool-on" : "whirlpool-container"
        }
      >
        {/* <Switch
          className="ant-switch-overlay"
          checkedChildren={<FunnelPlotOutlined />}
          unCheckedChildren={<FunnelPlotOutlined />}
          checked={this.state.showWhirlpool}
          onChange={() => {
            if (!this.waterSound) {
              this.waterSound = new Audio(WATER_SOUND);
              this.flushSound = new Audio(FLUSH_SOUND);
            }
            this.setState((prevState) => ({ showWhirlpool: !prevState.showWhirlpool }));
            if (!this.state.showWhirlpool) {
              this.waterSound.play();
            } else {
              this.waterSound.pause();
            }
          }}
        /> */}
        <FilePond
          server={this.server}
          name="file"
          beforeDropFile={this.props.beforeDropFile}
          beforeAddFile={this.props.beforeAddFile}
          allowRevert={this.props.allowRevert}
          onremovefile={this.props.onRemoveFile}
          allowMultiple={this.props.allowMultiple}
          onaddfilestart={this.props.addFileStart}
          allowReorder={this.props.allowReorder}
          maxFileSize={this.props.maxFileSize}
          allowFileTypeValidation={acceptedFileTypes.length > 0}
          acceptedFileTypes={acceptedFileTypes}
          onprocessfiles={this.props.onProcessFiles}
          onprocessfileabort={this.props.onAbort}
          labelIdle={this.props?.labelIdle}
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

// @ts-ignore (mismatches between function params on defaultProps)
FileUpload.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      pollDocumentUploadStatus,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(FileUpload);
