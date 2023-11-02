import React, { FC, useState, useRef, useEffect } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { notification } from "antd";
import DocumentCompressionWarningModal from "../modalContent/DocumentCompressionWarningModal";
import DocumentCompressedDownloadModal from "../modalContent/DocumentCompressedDownloadModal";
import CompressionNotificationProgressBar from "./CompressionNotificationProgressBar";
import {
  documentsCompression,
  pollDocumentsCompressionProgress,
} from "@/actionCreators/documentActionCreator";
import { ActionCreator } from "@/interfaces/actionCreator";
import { MineDocument } from "@mds/common/models/documents/document";

interface DocumentCompressionProps {
  documentType: string;
  rows: MineDocument[];
  setCompressionModalVisible: (arg1: boolean) => void;
  isCompressionModalVisible: boolean;
  compressionInProgress?: (arg1: boolean) => void;
  documentsCompression: ActionCreator<typeof documentsCompression>;
  pollDocumentsCompressionProgress: ActionCreator<typeof pollDocumentsCompressionProgress>;
  startFilesCompression: () => void;
  showArchiveDownloadWarning: boolean;
}

export const DocumentCompression: FC<DocumentCompressionProps> = (props) => {
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
    notification.close(props.documentType);
    props.compressionInProgress?.(false);
    setProgressBarVisible(false);
    setCompressionProgress(0);
  };

  const displayCompressionNotification = (message, description, duration) => {
    notification.warning({
      key: props.documentType,
      className: `progressNotification-${props.documentType}`,
      message,
      description,
      duration,
      placement: "topRight",
      onClose: handleCloseCompressionNotification,
      top: 85,
    });
  };

  const startFilesCompression = () => {
    props.setCompressionModalVisible(false);
    displayCompressionNotification("Compressing...", "Preparing files for download", 0);

    const mineGuid = props.rows[0].mine_guid;
    const documentManagerGuids = props.rows
      .filter((row) => row.is_latest_version && !row.is_archived)
      .map((filteredRows) => filteredRows.document_manager_guid);

    setEntityTitle(props.rows[0].entity_title || "");
    if (documentManagerGuids.length === 0) {
      setTimeout(() => {
        const description =
          "Only archived files or previous document versions were selected. To download \
        them you must go to the archived documents view or download them individually.";

        displayCompressionNotification("Error starting file compression", description, 15);
      }, 2000);
    } else {
      props.documentsCompression(mineGuid, documentManagerGuids).then((response) => {
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
          const documentTypeIdentifier = `.progressNotification-${props.documentType}`;
          const notificationElement = document.querySelector(documentTypeIdentifier);
          const notificationPosition = notificationElement.getBoundingClientRect();
          setNotificationTopPosition(notificationPosition.top);
          progressRef.current = true;
          props.compressionInProgress?.(true);
          setProgressBarVisible(true);
          const poll = async () => {
            const { data } = await props.pollDocumentsCompressionProgress(taskId);
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
    if (!props.showArchiveDownloadWarning && props.isCompressionModalVisible) {
      startFilesCompression();
    }
  }, [props.isCompressionModalVisible]);

  return (
    <div>
      {props.showArchiveDownloadWarning && (
        <DocumentCompressionWarningModal
          isModalVisible={props.isCompressionModalVisible}
          filesCompression={startFilesCompression}
          setModalVisible={props.setCompressionModalVisible}
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

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      documentsCompression,
      pollDocumentsCompressionProgress,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(DocumentCompression);
