import React, { FC, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import { Form, notification, Popover, Switch } from "antd";
import { uniq } from "lodash";
import { FunnelPlotOutlined } from "@ant-design/icons";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import * as tus from "tus-js-client";
import { HttpRequest, HttpResponse } from "tus-js-client";
import { APPLICATION_OCTET_STREAM, ENVIRONMENT, Feature, SystemFlagEnum } from "@mds/common/index";
import { pollDocumentUploadStatus } from "@mds/common/redux/actionCreators/documentActionCreator";
import { FileUploadHelper } from "@mds/common/utils/fileUploadHelper";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { FLUSH_SOUND, WATER_SOUND } from "@mds/common/constants/assets";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import {
  MultipartDocumentUpload,
  UploadResult,
} from "@mds/common/utils/fileUploadHelper.interface";
import { BaseInputProps } from "./BaseInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/pro-light-svg-icons";
import { FormContext } from "./FormWrapper";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

type ItemInsertLocationType = "before" | "after" | ((a: any, b: any) => number);
type AfterSuccessActionType = [
  (projectGuid, file, documentGuid) => Promise<void>,
  (projectGuid, irtGuid, file, documentGuid) => Promise<void>
];

interface FileUploadProps extends BaseInputProps {
  uploadUrl: string;
  acceptedFileTypesMap?: { [extension: string]: string | string[] };
  onFileLoad?: (fileName?: string, documentGuid?: string, versionGuid?: string) => void;
  chunkSize?: number;
  onAbort?: () => void;
  onUploadResponse?: (data: MultipartDocumentUpload) => void;
  onError?: (fileName?: string, err?: any) => void;
  onInit?: () => void;
  shouldAbortUpload?: boolean;
  shouldReplaceFile?: boolean;
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
  labelHref: string;

  beforeAddFile?: (file?: any) => any;
  beforeDropFile?: (file?: any) => any;
  onProcessFiles?: () => void;
  onRemoveFile?: (error, file) => void;
  addFileStart?: () => void;
}

export const FileUpload: FC<FileUploadProps> = ({
  maxFileSize = "750MB",
  acceptedFileTypesMap = {},
  onFileLoad = () => {},
  onRemoveFile = () => {},
  addFileStart = () => {},
  chunkSize = 1048576, // 1MB
  allowRevert = false,
  allowMultiple = true,
  allowReorder = false,
  onProcessFiles = () => {},
  onAbort = () => {},
  onInit = () => {},
  itemInsertLocation = "before" as ItemInsertLocationType,
  labelInstruction = '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong>',
  abbrevLabel = false,
  beforeAddFile = () => {},
  beforeDropFile = () => {},
  labelHref,
  label,
  required,
  meta,
  input,
  labelIdle,
  listedFileTypes,
  notificationDisabledStatusCodes,
  onError,
  afterSuccess,
  importIsSuccessful,
  onUploadResponse,
  shouldReplaceFile,
  uploadUrl,
  replaceFileUploadUrl,
  shouldAbortUpload,
}) => {
  const system = useSelector(getSystemFlag);
  const dispatch = useDispatch();
  const { isFeatureEnabled } = useFeatureFlag();
  const { isEditMode } = useContext(FormContext);

  const [showWhirlpool, setShowWhirlpool] = useState(false);

  // Used to store intermittent results of upload parts to enable
  // retries of parts that fail.
  const [uploadResults, setUploadResults] = useState<{ [fileId: string]: UploadResult[] }>({});

  // Used to store upload information about each upload and part
  // including pre-signed urls to enable retries of parts that fail,
  // and replace file functionality
  const [uploadData, setUploadData] = useState<{ [fileId: string]: MultipartDocumentUpload }>({});

  const getAcceptedFileTypesTypes = (): string[] => {
    const allTypes = Object.values(acceptedFileTypesMap).reduce((acc, type) => {
      const typeArray = Array.isArray(type) ? type : [type];
      return [...acc, ...typeArray];
    }, []);
    return uniq(allTypes);
  };

  const acceptedFileMimeTypes: string[] = getAcceptedFileTypesTypes();
  const acceptedFileTypeExtensions = uniq(Object.keys(acceptedFileTypesMap));

  const getfileValidateTypeLabelExpectedTypes = () => {
    const exts = acceptedFileTypeExtensions;
    const fileTypeList =
      exts.length === 1 ? exts[0] : `${exts.slice(0, -1).join(", ")} or ${exts[exts.length - 1]}`;
    return `Accepts ${fileTypeList}`;
  };
  const getFilePondLabel = () => {
    if (labelIdle) {
      return labelIdle;
    }
    const fileTypeList = listedFileTypes ?? acceptedFileTypeExtensions;
    let fileTypeDisplayString =
      fileTypeList.slice(0, -1).join(", ") + ", and " + fileTypeList.slice(-1);
    if (fileTypeList.length === 1) {
      fileTypeDisplayString = fileTypeList[0];
    }

    const fileSize = maxFileSize ? ` with max individual file size of ${maxFileSize}` : "";
    const secondLine = abbrevLabel
      ? `<div>We accept most common ${fileTypeDisplayString} files${fileSize}.</div>`
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
          notificationDisabledStatusCodes?.length &&
          notificationDisabledStatusCodes?.includes(response.status_code)
        )
      ) {
        notification.error({
          message: `Failed to upload ${file && file.name ? file.name : ""}: ${err}`,
          duration: 10,
        });
      }

      if (onError) {
        onError(file?.name ?? "", err);
      }
    } catch (e) {
      notification.error({
        message: `Failed to upload the file: ${e}`,
        duration: 10,
      });
    }
  };

  const handleSuccess = (documentGuid, file, load, abort, versionGuid?) => {
    let intervalId; // eslint-disable-line prefer-const

    const pollUploadStatus = async () => {
      const response = await dispatch(pollDocumentUploadStatus(documentGuid));
      if (response.data.status !== "In Progress") {
        clearInterval(intervalId);
        if (response.data.status === "Success") {
          load(documentGuid);

          onFileLoad(file.name, documentGuid, versionGuid);

          if (afterSuccess?.action) {
            try {
              if (afterSuccess?.irtGuid) {
                await afterSuccess.action[1](
                  afterSuccess?.projectGuid,
                  afterSuccess?.irtGuid,
                  file,
                  documentGuid
                );
              } else {
                await afterSuccess.action[0](afterSuccess?.projectGuid, file, documentGuid);
              }
              importIsSuccessful(true);
            } catch (err) {
              importIsSuccessful(false, err.response.data);
            }

            if (showWhirlpool) {
              flushSound.play();
            }
          }
        } else {
          if (onError) {
            onError(file?.name ?? "", response.data);
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

  function _s3MultipartUpload(fileId, uploadToUrl, file, metadata, load, error, progress, abort) {
    return new FileUploadHelper(file, {
      uploadUrl: ENVIRONMENT.apiUrl + uploadToUrl,
      // Pass along results and upload configuration if exists from
      // previous upload attempts for this file. Occurs if retrying a failed upload.
      uploadResults: uploadResults[fileId],
      uploadData: uploadData[fileId],
      metadata: {
        filename: file.name,
        filetype: file.type || APPLICATION_OCTET_STREAM,
      },
      onError: (err, uploadResult) => {
        setUploadResultsFor(fileId, uploadResult);
        handleError(file, err);
        error(err);
      },
      onInit: (docUploadData) => {
        setUploadDataFor(fileId, docUploadData);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        progress(true, bytesUploaded, bytesTotal);
      },
      onSuccess: (documentGuid, versionGuid) => {
        handleSuccess(documentGuid, file, load, abort, versionGuid);
      },
      onUploadResponse: onUploadResponse,
    });
  }

  function _tusdUpload(fileId, uploadToUrl, file, metadata, load, error, progress, abort) {
    const upload = new tus.Upload(file, {
      endpoint: ENVIRONMENT.apiUrl + uploadToUrl,
      retryDelays: [100, 1000, 3000],
      removeFingerprintOnSuccess: true,
      chunkSize: chunkSize,
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
        if (!onUploadResponse) {
          return;
        }
        const responseBody = response.getBody();

        if (responseBody) {
          const jsonString = responseBody.replace(/'/g, '"');

          const obj = JSON.parse(jsonString);
          if (obj) {
            onUploadResponse(obj);
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

      const uploadToUrl = shouldReplaceFile ? replaceFileUploadUrl : uploadUrl;

      if (isFeatureEnabled(Feature.MULTIPART_UPLOAD)) {
        upload = _s3MultipartUpload(
          metadata.filepondid,
          uploadToUrl,
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
          uploadToUrl,
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
    if (shouldAbortUpload) {
      filepond.removeFile();
    }
  }, [shouldAbortUpload]);

  useEffect(() => {
    if (shouldReplaceFile) {
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
  }, [shouldReplaceFile]);

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

  const getLabel = () => {
    let labelHrefElement = null;
    if (labelHref) {
      labelHrefElement = (
        <a href={labelHref} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }

    if (abbrevLabel && acceptedFileTypeExtensions.length > 0) {
      return (
        <span>
          {labelHrefElement ?? label}{" "}
          <span>
            <Popover
              content={
                <>
                  <strong>Accepted File Types:</strong>
                  <p>{acceptedFileTypeExtensions.join(", ")}</p>
                </>
              }
              placement="topLeft"
              color="white"
              overlayClassName="filepond-filetypes-popover"
            >
              <span className="form-dashed-underline">
                Accepted file types{" "}
                <FontAwesomeIcon icon={faCircleQuestion} style={{ width: "15px" }} />
              </span>
            </Popover>
          </span>
        </span>
      );
    }

    if (labelHrefElement) {
      return labelHrefElement;
    }

    return <>{label}</>;
  };

  if (!isEditMode) {
    return null;
  }

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
        name={input?.name}
        required={required}
        label={getLabel()}
        validateStatus={
          meta?.touched ? (meta?.error && "error") || (meta?.warning && "warning") : ""
        }
        help={
          meta?.touched &&
          ((meta?.error && <span>{meta?.error}</span>) ||
            (meta?.warning && <span>{meta?.warning}</span>))
        }
      >
        <>
          <FilePond
            ref={(ref) => (filepond = ref)}
            server={server}
            name="file"
            beforeDropFile={beforeDropFile}
            beforeAddFile={beforeAddFile}
            allowRevert={allowRevert}
            onremovefile={onRemoveFile}
            allowMultiple={allowMultiple}
            onaddfilestart={addFileStart}
            allowReorder={allowReorder}
            maxParallelUploads={1}
            maxFileSize={maxFileSize}
            minFileSize="1"
            allowFileTypeValidation={acceptedFileMimeTypes.length > 0}
            acceptedFileTypes={acceptedFileMimeTypes}
            onaddfile={handleFileAdd}
            onprocessfiles={onProcessFiles}
            onprocessfileabort={onAbort}
            oninit={onInit}
            labelIdle={getFilePondLabel()}
            itemInsertLocation={itemInsertLocation}
            credits={null}
            fileValidateTypeLabelExpectedTypes={getfileValidateTypeLabelExpectedTypes()}
            fileValidateTypeDetectType={(source, type) =>
              new Promise((resolve, reject) => {
                // If the browser can't automatically detect the file's MIME type, use the one stored in the "accepted file types" map.
                if (!type) {
                  const exts = source.name.split(".");
                  const ext = exts?.length > 0 && `.${exts.pop().toLowerCase()}`;

                  if (ext && acceptedFileTypeExtensions.includes(ext)) {
                    const match = acceptedFileTypesMap[ext];
                    type = Array.isArray(match) ? match[0] : match;
                  } else {
                    reject(type);
                  }
                }
                resolve(type);
              })
            }
          />
        </>
      </Form.Item>
    </div>
  );
};

export default FileUpload;
