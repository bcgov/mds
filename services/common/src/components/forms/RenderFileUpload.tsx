import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import { Form, Popover, Switch, notification } from "antd";
import { invert, uniq } from "lodash";
import { FunnelPlotOutlined } from "@ant-design/icons";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import * as tus from "tus-js-client";
import { APPLICATION_OCTET_STREAM, ENVIRONMENT, SystemFlagEnum } from "@mds/common/index";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { pollDocumentUploadStatus } from "@mds/common/redux/actionCreators/documentActionCreator";
import { FileUploadHelper } from "@mds/common/utils/fileUploadHelper";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { FLUSH_SOUND, WATER_SOUND } from "@mds/common/constants/assets";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import {
  MultipartDocumentUpload,
  UploadResult,
} from "@mds/common/utils/fileUploadHelper.interface";
import { HttpRequest, HttpResponse } from "tus-js-client";
import { BaseInputProps } from "./BaseInput";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

type ItemInsertLocationType = "before" | "after" | ((a: any, b: any) => number);
type AfterSuccessActionType = [
  (projectGuid, file, documentGuid) => Promise<void>,
  (projectGuid, irtGuid, file, documentGuid) => Promise<void>
];

interface FileUploadProps extends BaseInputProps {
  uploadUrl: string;
  acceptedFileTypesMap?: { [key: string]: string };
  onFileLoad?: (fileName?: string, documentGuid?: string, versionGuid?: string) => void;
  chunkSize?: number;
  onAbort?: () => void;
  onUploadResponse?: (data: MultipartDocumentUpload) => void;
  onError?: (fileName?: string, err?: any) => void;
  onInit?: () => void;
  isFeatureEnabled: (feature: string) => boolean;
  pollDocumentUploadStatus: (documentGuid: string) => Promise<{ data: { status: string } }>;
  shouldAbortUpload?: boolean;
  shouldReplaceFile?: boolean;
  file?: any;
  notificationDisabledStatusCodes?: number[];

  replaceFileUploadUrl?: string;
  afterSuccess?: { action: AfterSuccessActionType; projectGuid: string; irtGuid: string };
  importIsSuccessful?: (isSuccessful: boolean, err?: any) => void;
  // Properties that are passed along directly to FilePond
  allowRevert?: boolean;
  allowMultiple?: boolean;
  allowReorder?: boolean;
  maxFileSize?: string;
  itemInsertLocation?: ItemInsertLocationType;
  // for a completely customized drop label
  labelIdle?: string;
  // otherwise- can set the "Drag & drop" text,
  labelInstruction?: string;
  // and the accepted file types to display (empty will use extensions from acceptedFileTypesMap)
  listedFileTypes?: string[];
  // true for "We accept most common ${listedFileTypes.join()} files" language + popover
  abbrevLabel?: boolean;
  maxFiles?: number;

  beforeAddFile?: (file?: any) => any;
  beforeDropFile?: (file?: any) => any;
  onProcessFiles?: () => void;
  onRemoveFile?: () => void;
  addFileStart?: () => void;
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
  onInit: () => {},
  itemInsertLocation: "before" as ItemInsertLocationType,
  labelInstruction:
    '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong>',
  abbrevLabel: false,
  beforeAddFile: () => {},
  beforeDropFile: () => {},
  file: null,
  maxFiles: undefined,
};

export const FileUpload = (props: FileUploadProps) => {
  props = { ...defaultProps, ...props };

  const system = useSelector(getSystemFlag);

  const [showWhirlpool, setShowWhirlpool] = useState(false);

  // Used to store intermittent results of upload parts to enable
  // retries of parts that fail.
  const [uploadResults, setUploadResults] = useState<{ [fileId: string]: UploadResult[] }>({});

  // Used to store upload information about each upload and part
  // including pre-signed urls to enable retries of parts that fail,
  // and replace file functionality
  const [uploadData, setUploadData] = useState<{ [fileId: string]: MultipartDocumentUpload }>({});

  const getFilePondLabel = () => {
    const {
      labelIdle,
      labelInstruction,
      listedFileTypes,
      abbrevLabel,
      acceptedFileTypesMap,
    } = props;
    if (labelIdle) {
      return labelIdle;
    }
    const fileTypeDisplayString = listedFileTypes
      ? listedFileTypes.join(", ")
      : Object.keys(acceptedFileTypesMap).join(", ");
    const secondLine = abbrevLabel
      ? `<div>We accept most common ${fileTypeDisplayString} files</div>`
      : `<div>Accepted filetypes: ${fileTypeDisplayString}</div>`;
    return `${labelInstruction}<br>${secondLine}`;
  };

  // Stores metadata and process function for each file, so we can manually
  // trigger it. Currently, this is being used for the replace file functionality
  // which dynamically changes the URL of the upload if you confirm the replacement
  const [uploadProcess, setUploadProcess] = useState<{
    [fileId: string]: {
      fieldName: string;
      file: File;
      metadata: any;
      load: (documentGuid: string) => void;
      error: (file: File, err: any) => void;
      progress: (file: File, progress: number) => void;
      abort: () => void;
    };
  }>({});

  let waterSound;
  let flushSound;
  let filepond;

  const handleError = (file, err) => {
    try {
      const response = err.originalRequest
        ? JSON.parse(err.originalRequest.getUnderlyingObject().response)
        : err || {};

      if (
        !(
          props.notificationDisabledStatusCodes?.length &&
          props.notificationDisabledStatusCodes?.includes(response.status_code)
        )
      ) {
        notification.error({
          message: `Failed to upload ${file && file.name ? file.name : ""}: ${err}`,
          duration: 10,
        });
      }

      if (props.onError) {
        props.onError(file && file.name ? file.name : "", err);
      }
    } catch (err) {
      notification.error({
        message: `Failed to upload the file: ${err}`,
        duration: 10,
      });
    }
  };

  const handleSuccess = (documentGuid, file, load, abort, versionGuid?) => {
    let intervalId; // eslint-disable-line prefer-const

    const pollUploadStatus = async () => {
      const response = await props.pollDocumentUploadStatus(documentGuid);
      if (response.data.status !== "In Progress") {
        clearInterval(intervalId);
        if (response.data.status === "Success") {
          load(documentGuid);

          props.onFileLoad(file.name, documentGuid, versionGuid);

          if (props?.afterSuccess?.action) {
            try {
              if (props.afterSuccess?.irtGuid) {
                await props.afterSuccess.action[1](
                  props.afterSuccess?.projectGuid,
                  props.afterSuccess?.irtGuid,
                  file,
                  documentGuid
                );
              } else {
                await props.afterSuccess.action[0](
                  props.afterSuccess?.projectGuid,
                  file,
                  documentGuid
                );
              }
              props.importIsSuccessful(true);
            } catch (err) {
              props.importIsSuccessful(false, err);
            }

            if (showWhirlpool) {
              flushSound.play();
            }
          }
        } else {
          if (props.onError) {
            props.onError(file && file.name ? file.name : "", response.data);
          }

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
    intervalId = setInterval(pollUploadStatus, 1000);
  };

  const setUploadResultsFor = (fileId, results) => {
    setUploadResults({
      ...uploadResults,
      [fileId]: results,
    });
  };

  const setUploadProcessFor = (fileId, process) => {
    setUploadProcess({
      ...uploadProcess,
      [fileId]: process,
    });
  };
  const setUploadDataFor = (fileId, data) => {
    setUploadData({
      ...uploadData,
      [fileId]: data,
    });
  };

  function _s3MultipartUpload(fileId, uploadUrl, file, metadata, load, error, progress, abort) {
    return new FileUploadHelper(file, {
      uploadUrl: ENVIRONMENT.apiUrl + uploadUrl,
      // Pass along results and upload configuration if exists from
      // previous upload attempts for this file. Occurs if retrying a failed upload.
      uploadResults: uploadResults[fileId],
      uploadData: uploadData[fileId],
      metadata: {
        filename: file.name,
        filetype: file.type || APPLICATION_OCTET_STREAM,
      },
      onError: (err, uploadResults) => {
        setUploadResultsFor(fileId, uploadResults);
        handleError(file, err);
        error(err);
      },
      onInit: (uploadData) => {
        setUploadDataFor(fileId, uploadData);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        progress(true, bytesUploaded, bytesTotal);
      },
      onSuccess: (documentGuid, versionGuid) => {
        handleSuccess(documentGuid, file, load, abort, versionGuid);
      },
      onUploadResponse: props.onUploadResponse,
    });
  }

  function _tusdUpload(fileId, uploadUrl, file, metadata, load, error, progress, abort) {
    const upload = new tus.Upload(file, {
      endpoint: ENVIRONMENT.apiUrl + uploadUrl,
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
        const xhr = req.getUnderlyingObject();
        const { headers } = createRequestHeader();

        xhr.setRequestHeader("Authorization", headers.Authorization);
      },
      onError: (err: any) => {
        handleError(file, err);

        error(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        progress(true, bytesUploaded, bytesTotal);
      },
      onAfterResponse: (request: HttpRequest, response: HttpResponse) => {
        if (!props.onUploadResponse) {
          return;
        }
        const responseBody = response.getBody();

        if (responseBody) {
          const jsonString = responseBody.replace(/'/g, '"');

          const obj = JSON.parse(jsonString);
          if (obj) {
            props.onUploadResponse(obj);
          }
        }
      },
      onSuccess: () => {
        const documentGuid = upload.url.split("/").pop();
        handleSuccess(documentGuid, file, load, abort);
      },
    });

    return upload;
  }

  const server = {
    process: (
      fieldName,
      file,
      metadata,
      load,
      error,
      progress,
      abort,
      transfer = null,
      options = null
    ) => {
      let upload;

      setUploadProcessFor(metadata.filepondid, {
        fieldName,
        file,
        metadata,
        load,
        error,
        progress,
        abort,
      });

      setUploadDataFor(metadata.filepondid, null);
      setUploadResultsFor(metadata.filepondid, []);

      const uploadUrl = props.shouldReplaceFile ? props.replaceFileUploadUrl : props.uploadUrl;

      if (props.isFeatureEnabled("s3_multipart_upload")) {
        upload = _s3MultipartUpload(
          metadata.filepondid,
          uploadUrl,
          file,
          metadata,
          load,
          error,
          progress,
          abort
        );
      } else {
        upload = _tusdUpload(
          metadata.filepondid,
          uploadUrl,
          file,
          metadata,
          load,
          error,
          progress,
          abort
        );
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

  useEffect(() => {
    if (props.shouldAbortUpload) {
      filepond.removeFile();
    }
  }, [props.shouldAbortUpload]);

  useEffect(() => {
    if (props.shouldReplaceFile) {
      server.process(
        uploadProcess.fieldName,
        uploadProcess.file,
        uploadProcess.metadata,
        uploadProcess.load,
        uploadProcess.error,
        uploadProcess.progress,
        uploadProcess.abort
      );
    }
  }, [props.shouldReplaceFile]);

  useEffect(() => {
    return () => {
      if (waterSound) {
        waterSound.pause();
      }

      if (flushSound) {
        flushSound.pause();
      }
    };
  }, []);

  const handleFileAdd = (err, file) => {
    // Add ID to file metadata so we can reference it later
    file.setMetadata("filepondid", file.id);
  };

  const fileValidateTypeLabelExpectedTypesMap = invert(props.acceptedFileTypesMap);
  const acceptedFileTypes = uniq(Object.values(props.acceptedFileTypesMap));

  return (
    <div className={showWhirlpool ? "whirlpool-container whirlpool-on" : "whirlpool-container"}>
      {system === SystemFlagEnum.core && (
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
      )}
      <Form.Item
        name={props.input?.name}
        required={props.required}
        label={props.label}
        validateStatus={
          props.meta?.touched
            ? (props.meta?.error && "error") || (props.meta?.warning && "warning")
            : ""
        }
        help={
          props.meta?.touched &&
          ((props.meta?.error && <span>{props.meta?.error}</span>) ||
            (props.meta?.warning && <span>{props.meta?.warning}</span>))
        }
      >
        <>
          <FilePond
            ref={(ref) => (filepond = ref)}
            server={server}
            name="file"
            beforeDropFile={props.beforeDropFile}
            beforeAddFile={props.beforeAddFile}
            allowRevert={props.allowRevert}
            onremovefile={props.onRemoveFile}
            allowMultiple={props.allowMultiple}
            onaddfilestart={props.addFileStart}
            allowReorder={props.allowReorder}
            maxParallelUploads={1}
            maxFileSize={props.maxFileSize}
            allowFileTypeValidation={acceptedFileTypes.length > 0}
            acceptedFileTypes={acceptedFileTypes}
            onaddfile={handleFileAdd}
            onprocessfiles={props.onProcessFiles}
            onprocessfileabort={props.onAbort}
            oninit={props.onInit}
            labelIdle={getFilePondLabel()}
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
          {props.abbrevLabel && (
            <div className="filepond-popover-container">
              <Popover
                content={
                  <>
                    <strong>Accepted File Types:</strong>
                    <p>{Object.keys(props.acceptedFileTypesMap).join(", ")}</p>
                  </>
                }
                placement="topRight"
                color="white"
                overlayClassName="filepond-filetypes-popover"
              >
                View accepted file types
              </Popover>
            </div>
          )}
        </>
      </Form.Item>
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
