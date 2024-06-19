import React, { FC, useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { notification } from "antd";
import CompressionNotificationProgressBar from "@mds/common/components/documents/CompressionNotificationProgressBar";
import { MineDocument } from "@mds/common/models/documents/document";
import {
  documentsCompression,
  pollDocumentsCompressionProgress,
} from "@mds/common/redux/actionCreators/documentActionCreator";
import DocumentCompressionWarningModal from "./DocumentCompressionWarningModal";
import DocumentCompressedDownloadModal from "./DocumentCompressedDownloadModal";

interface DocumentCompressionProps {
  documentType?: string;
  mineDocuments: MineDocument[];
  setCompressionModalVisible: (isVisible: boolean) => void;
  isCompressionModalVisible: boolean;
  setCompressionInProgress?: (isInProgress: boolean) => void;
  showDownloadWarning: boolean;
}

const DocumentCompression: FC<DocumentCompressionProps> = ({
  documentType = "all",
  mineDocuments,
  setCompressionModalVisible,
  isCompressionModalVisible,
  setCompressionInProgress,
  showDownloadWarning,
}) => {
  const dispatch = useDispatch();
  const [isDownloadModalVisible, setDownloadModalVisible] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isProgressBarVisible, setProgressBarVisible] = useState(false);
  const [notificationTopPosition, setNotificationTopPosition] = useState(0);
  const [fileToDownload, setFileToDownload] = useState("");
  const [entityTitle, setEntityTitle] = useState("");

  const progressRef = useRef(false);

  const handleCloseCompressionNotification = () => {
    progressRef.current = false;
    setDownloadModalVisible(false);
    notification.close(documentType);
    setCompressionInProgress?.(false);
    setProgressBarVisible(false);
    setCompressionProgress(0);
  };

  const displayCompressionNotification = (message, description, duration) => {
    notification.warning({
      key: documentType,
      className: `progressNotification-${documentType}`,
      message,
      description,
      duration,
      placement: "topRight",
      onClose: handleCloseCompressionNotification,
      top: 85,
    });
  };

  const startFilesCompression = () => {
    setCompressionModalVisible(false);
    displayCompressionNotification("Compressing...", "Preparing files for download", 0);

    const mineGuid = mineDocuments[0].mine_guid;
    const documentManagerGuids = mineDocuments
      .filter((row) => row.is_latest_version && !row.is_archived)
      .map((filteredRows) => filteredRows.document_manager_guid);

    setEntityTitle(mineDocuments[0].entity_title || "");
    if (documentManagerGuids.length === 0) {
      setTimeout(() => {
        const description =
          "Only archived files or previous document versions were selected. To download \
        them you must go to the archived documents view or download them individually.";

        displayCompressionNotification("Error starting file compression", description, 15);
      }, 2000);
    } else {
      dispatch(documentsCompression(mineGuid, documentManagerGuids)).then((response) => {
        console.log("response", response);
        const taskId = response.data && response.data.task_id ? response.data.task_id : null;
        if (!taskId) {
          setTimeout(() => {
            displayCompressionNotification(
              "Error starting file compression",
              "An invalid task id was provided",
              10
            );
          }, 2000);
        } else {
          const documentTypeIdentifier = `.progressNotification-${documentType}`;
          const notificationElement = document.querySelector(documentTypeIdentifier);
          const notificationPosition = notificationElement.getBoundingClientRect();
          setNotificationTopPosition(notificationPosition.top);
          progressRef.current = true;
          setCompressionInProgress?.(true);
          setProgressBarVisible(true);
          const poll = async () => {
            const { data } = await dispatch(pollDocumentsCompressionProgress(taskId));
            if (data.progress) {
              setCompressionProgress(data.progress);
            }

            if (data.state !== "SUCCESS" && progressRef.current) {
              setTimeout(poll, 2000);
            } else if (data.state === "SUCCESS" && data?.error.length > 0) {
              setProgressBarVisible(false);
              displayCompressionNotification(
                "Error compressing files",
                "Unable to retrieve files",
                10
              );
            } else {
              setFileToDownload(data.success_docs[0]);
              setDownloadModalVisible(true);
            }
          };

          poll();
        }
      });
    }
  };

  useEffect(() => {
    if (!showDownloadWarning && isCompressionModalVisible) {
      startFilesCompression();
    }
  }, [isCompressionModalVisible]);

  return (
    <div>
      {showDownloadWarning && (
        <DocumentCompressionWarningModal
          isModalVisible={isCompressionModalVisible}
          filesCompression={startFilesCompression}
          setModalVisible={setCompressionModalVisible}
        />
      )}
      {isProgressBarVisible && (
        <CompressionNotificationProgressBar
          compressionProgress={compressionProgress}
          notificationTopPosition={notificationTopPosition}
        />
      )}
      <DocumentCompressedDownloadModal
        isModalVisible={isDownloadModalVisible}
        closeCompressNotification={handleCloseCompressionNotification}
        documentManagerGuid={fileToDownload}
        entityTitle={entityTitle}
      />
    </div>
  );
};

export default DocumentCompression;

// const mapDispatchToProps = (dispatch) =>
//   bindActionCreators(
//     {
//       // documentsCompression,
//       pollDocumentsCompressionProgress,
//     },
//     dispatch
//   );

// export default connect(null, mapDispatchToProps)(DocumentCompression);
