/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import { Switch, notification } from "antd";
import { invert, uniq } from "lodash";
import { FunnelPlotOutlined } from "@ant-design/icons";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import * as tus from "tus-js-client";
import { APPLICATION_OCTET_STREAM, ENVIRONMENT } from "@mds/common/index";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { pollDocumentUploadStatus } from "@mds/common/redux/actionCreators/documentActionCreator";
import { FileUploadHelper } from "@mds/common/utils/fileUploadHelper";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { FLUSH_SOUND, WATER_SOUND } from "@mds/common/constants/assets";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

type ItemInsertLocationType = "before" | "after" | ((a: any, b: any) => number);

interface FileUploadProps {
  uploadUrl: string;
  maxFileSize?: string;
  acceptedFileTypesMap?: { [key: string]: string };
  onFileLoad?: (fileName?: string, documentGuid?: string) => void;
  onRemoveFile?: () => void;
  addFileStart?: () => void;
  chunkSize?: number;
  labelIdle?: string;
  allowRevert?: boolean;
  allowMultiple?: boolean;
  allowReorder?: boolean;
  onProcessFiles?: () => void;
  onAbort?: () => void;
  itemInsertLocation?: ItemInsertLocationType;
  onAfterResponse?: () => void;
  beforeAddFile?: (file?: any) => any;
  beforeDropFile?: (file?: any) => any;
  isFeatureEnabled: (feature: string) => boolean;
  pollDocumentUploadStatus: (documentGuid: string) => Promise<{ data: { status: string } }>;
}

const defaultProps = {
  maxFileSize: "750MB",
  acceptedFileTypesMap: {},
  onFileLoad: () => {},
  onRemoveFile: () => {},
  addFileStart: () => {},
  chunkSize: 1048576, // 1MB
  allowRevert: false,
  allowMultiple: true,
  allowReorder: false,
  onProcessFiles: () => {},
  onAbort: () => {},
  itemInsertLocation: "before" as ItemInsertLocationType,
  labelIdle:
    '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br> \
  <div>Accepted filetypes: .kmz, .doc, .docx, .xlsx, .pdf</div>',
  onAfterResponse: () => {},
  beforeAddFile: () => {},
  beforeDropFile: () => {},
};

const FileUpload = (props: FileUploadProps) => {
  props = { ...defaultProps, ...props };

  const [showWhirlpool, setShowWhirlpool] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadData, setUploadData] = useState(null);
  let waterSound;
  let flushSound;

  const server = {
    process: (fieldName, file, metadata, load, error, progress, abort) => {
      let upload;

      if (props.isFeatureEnabled("s3_multipart_upload")) {
        upload = _s3MultipartUpload(file, metadata, load, error, progress, abort);
      } else {
        upload = _tusdUpload(file, metadata, load, error, progress, abort);
      }

      upload.start();

      return {
        abort: () => {
          upload.abort();
          abort();
        },
      };
    },
  };

  const _s3MultipartUpload = (file, metadata, load, error, progress, abort) => {
    return new FileUploadHelper(file, {
      uploadUrl: ENVIRONMENT.apiUrl + props.uploadUrl,
      uploadResults: uploadResults,
      uploadData: uploadData,
      metadata: {
        filename: file.name,
        filetype: file.type || APPLICATION_OCTET_STREAM,
      },
      onError: (err, uploadResults) => {
        setUploadResults(uploadResults);
        notification.error({
          message: `Failed to upload ${file.name}: ${err}`,
          duration: 10,
        });
        error(err);
      },
      onInit: (uploadData) => {
        setUploadData(uploadData);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        progress(true, bytesUploaded, bytesTotal);
      },
      onSuccess: (documentGuid) => {
        load(documentGuid);
        props.onFileLoad(file.name, documentGuid);

        if (showWhirlpool) {
          flushSound.play();
        }
      },
    });
  };

  const _tusdUpload = (file, metadata, load, error, progress, abort) => {
    const upload = new tus.Upload(file, {
      endpoint: ENVIRONMENT.apiUrl + props.uploadUrl,
      retryDelays: [100, 1000, 3000],
      removeFingerprintOnSuccess: true,
      chunkSize: props.chunkSize,
      metadata: {
        filename: file.name,
        filetype: file.type || APPLICATION_OCTET_STREAM,
      },
      onBeforeRequest: (req) => {
        // Set authorization header on each request to make use
        // of the new token in case of a token refresh was performed
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
      onAfterResponse: props.onAfterResponse,
      onSuccess: () => {
        const documentGuid = upload.url.split("/").pop();

        const pollUploadStatus = async () => {
          const response = await props.pollDocumentUploadStatus(documentGuid);
          if (response.data.status !== "In Progress") {
            clearInterval(intervalId);
            if (response.data.status === "Success") {
              load(documentGuid);
              props.onFileLoad(file.name, documentGuid);
              if (showWhirlpool) {
                flushSound.play();
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

    return upload;
  };

  // componentWillUnmount() {
  //     if (this.flushSound) {
  //         this.flushSound.removeEventListener("ended", () => this.setState({ play: false }));
  //     }
  // }

  const fileValidateTypeLabelExpectedTypesMap = invert(props.acceptedFileTypesMap);
  const acceptedFileTypes = uniq(Object.values(props.acceptedFileTypesMap));

  return (
    <div className={showWhirlpool ? "whirlpool-container whirlpool-on" : "whirlpool-container"}>
      <Switch
        className="ant-switch-overlay"
        checkedChildren={<FunnelPlotOutlined />}
        unCheckedChildren={<FunnelPlotOutlined />}
        checked={showWhirlpool}
        onChange={() => {
          if (!waterSound) {
            waterSound = new Audio(WATER_SOUND);
            flushSound = new Audio(FLUSH_SOUND);
          }

          setShowWhirlpool(!showWhirlpool);

          if (!showWhirlpool) {
            waterSound.play();
          } else {
            waterSound.pause();
          }
        }}
      />
      <FilePond
        server={server}
        name="file"
        beforeDropFile={props.beforeDropFile}
        beforeAddFile={props.beforeAddFile}
        allowRevert={props.allowRevert}
        onremovefile={props.onRemoveFile}
        allowMultiple={props.allowMultiple}
        onaddfilestart={props.addFileStart}
        allowReorder={props.allowReorder}
        maxFileSize={props.maxFileSize}
        allowFileTypeValidation={acceptedFileTypes.length > 0}
        acceptedFileTypes={acceptedFileTypes}
        onprocessfiles={props.onProcessFiles}
        onprocessfileabort={props.onAbort}
        labelIdle={props?.labelIdle}
        itemInsertLocation={props?.itemInsertLocation}
        credits={null}
        fileValidateTypeLabelExpectedTypesMap={fileValidateTypeLabelExpectedTypesMap}
        fileValidateTypeDetectType={(source, type) =>
          new Promise((resolve, reject) => {
            // If the browser can't automatically detect the file's MIME type, use the one stored in the "accepted file types" map.
            if (!type) {
              const exts = source.name.split(".");
              const ext = exts && exts.length > 0 && `.${exts.pop()}`;
              if (ext && ext in props.acceptedFileTypesMap) {
                type = props.acceptedFileTypesMap[ext];
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
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      pollDocumentUploadStatus,
    },
    dispatch
  );

export default withFeatureFlag(connect(null, mapDispatchToProps)(FileUpload));
