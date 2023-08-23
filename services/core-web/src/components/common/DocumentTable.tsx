import React, { useState, useRef, useEffect } from "react";
import CoreTable from "@/components/common/CoreTable";
import {
  documentNameColumn,
  documentNameColumnNew,
  uploadDateColumn,
  uploadedByColumn,
} from "./DocumentColumns";
import { renderTextColumn, renderActionsColumn, ITableAction } from "./CoreTableCommonColumns";
import { some } from "lodash";
import { closeModal, openModal } from "@common/actions/modalActions";
import BeginCompressionModal from "@/components/modalContent/BeginCompressionModal";
import CompressedFilesDownloadModal from "../modalContent/CompressedFilesDownloadModal";
import CompressionNotificationProgressBar from "./CompressionNotificationProgressBar";
import { archiveMineDocuments } from "@common/actionCreators/mineActionCreator";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { modalConfig } from "@/components/modalContent/config";
import { Feature, isFeatureEnabled } from "@mds/common";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { ColumnType, ColumnsType } from "antd/es/table";
import { FileOperations, MineDocument } from "@common/models/documents/document";
import {
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  InboxOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { openDocument } from "../syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { Dropdown, Button, MenuProps, notification } from "antd";
import { DownOutlined } from "@ant-design/icons";
import {
  documentsCompression,
  pollDocumentsCompressionProgress,
} from "@/actionCreators/documentActionCreator";
import { ActionCreator } from "@/interfaces/actionCreator";

interface DocumentTableProps {
  documents: MineDocument[];
  isLoaded: boolean;
  isViewOnly: boolean;
  canArchiveDocuments: boolean;
  showVersionHistory: boolean;
  enableBulkActions: boolean;
  documentParent: string;
  view: string;
  openModal: (arg) => void;
  openDocument: any;
  closeModal: () => void;
  removeDocument: (event, doc_guid: string, mine_guid: string) => void;
  archiveMineDocuments: (mineGuid: string, mineDocumentGuids: string[]) => void;
  onArchivedDocuments: (docs?: MineDocument[]) => void;
  documentColumns: ColumnType<unknown>[];
  additionalColumns: ColumnType<MineDocument>[];
  defaultSortKeys: string[];
  excludedColumnKeys: string[];
  additionalColumnProps: { key: string; colProps: any }[];
  fileOperationPermissionMap: { operation: FileOperations; permission: string | boolean }[];
  userRoles: string[];
  documentsCompression: ActionCreator<typeof documentsCompression>;
  pollDocumentsCompressionProgress: ActionCreator<typeof pollDocumentsCompressionProgress>;
  handleRowSelectionChange: (arg1: MineDocument[]) => void;
  startFilesCompression: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-shadow
export const DocumentTable = ({
  isViewOnly = false,
  excludedColumnKeys = [],
  additionalColumnProps = [],
  documentColumns = null,
  additionalColumns = [],
  documentParent = null,
  isLoaded = true,
  showVersionHistory = false,
  enableBulkActions = false,
  defaultSortKeys = ["upload_date", "dated", "update_timestamp"],
  view = "standard",
  canArchiveDocuments = false,
  openModal,
  closeModal,
  removeDocument,
  openDocument,
  ...props
}: DocumentTableProps) => {
  const [rowSelection, setRowSelection] = useState([]);
  const [isBeginCompressionModalVisible, setBeginCompressionModalVisible] = useState(false);
  const [isReadyForDownloadModalVisible, setReadyForDownloadModalVisible] = useState(false);
  const [isCompressionProgressVisible, setCompressionProgressVisible] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [documentTypeCode, setDocumentTypeCode] = useState("");
  const [notificationTopPosition, setNotificationTopPosition] = useState(0);
  const [fileToDownload, setFileToDownload] = useState("");
  const [entityTitle, setEntityTitle] = useState("");
  const [documentsCanBulkDropDown, setDocumentsCanBulkDropDown] = useState(false);

  const progressRef = useRef(false);

  const allowedTableActions = {
    [FileOperations.View]: true,
    [FileOperations.Download]: true,
    [FileOperations.Replace]: !isViewOnly,
    [FileOperations.Archive]:
      !isViewOnly && canArchiveDocuments && isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE),
    [FileOperations.Delete]: !isViewOnly && removeDocument !== undefined,
  };

  const isMinimalView: boolean = view === "minimal";

  const parseDocuments = (docs: any[]): MineDocument[] => {
    let parsedDocs: MineDocument[];
    if (docs.length && docs[0] instanceof MineDocument) {
      parsedDocs = docs;
    } else {
      parsedDocs = docs.map((doc) => new MineDocument(doc));
    }
    return parsedDocs.map((doc) => {
      doc.setAllowedActions(props.userRoles);
      return doc;
    });
  };

  const documents = parseDocuments(props.documents ?? []);

  useEffect(() => {
    const isBulkArchive = documents.every((doc) =>
      doc.allowed_actions.find((a) => a === FileOperations.Archive)
    );

    setDocumentsCanBulkDropDown(isBulkArchive);
  }, []);

  const openArchiveModal = (event, docs: MineDocument[]) => {
    const mineGuid = docs[0].mine_guid;
    event.preventDefault();
    openModal({
      props: {
        title: `Archive ${docs?.length > 1 ? "Multiple Files" : "File"}`,
        closeModal: closeModal,
        handleSubmit: async () => {
          await props.archiveMineDocuments(
            mineGuid,
            docs.map((d) => d.mine_document_guid)
          );
          if (props.onArchivedDocuments) {
            props.onArchivedDocuments(docs);
          }
        },
        documents: docs,
      },
      content: modalConfig.ARCHIVE_DOCUMENT,
    });
  };

  const openDeleteModal = (event, docs: MineDocument[]) => {
    event.preventDefault();
    openModal({
      props: {
        title: `Delete ${docs?.length > 1 ? "Multiple Files" : "File"}`,
        closeModal: closeModal,
        handleSubmit: async () => {
          docs.forEach((record) => removeDocument(event, record.key, documentParent));
        },
        documents: docs,
      },
      content: modalConfig.DELETE_DOCUMENT,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const actions = [
    {
      key: "view",
      label: FileOperations.View,
      icon: <FileOutlined />,
      clickFunction: (_event, record: MineDocument) =>
        openDocument(record.document_manager_guid, record.mine_document_guid),
    },
    {
      key: "download",
      label: FileOperations.Download,
      icon: <DownloadOutlined />,
      clickFunction: (_event, record: MineDocument) => {
        return downloadFileFromDocumentManager(record);
      },
    },
    {
      key: "replace",
      label: FileOperations.Replace,
      icon: <SyncOutlined />,
      clickFunction: (_event, _record: MineDocument) => alert("Not implemented"),
    },
    {
      key: "archive",
      label: FileOperations.Archive,
      icon: <InboxOutlined />,
      clickFunction: (event, record: MineDocument) => openArchiveModal(event, [record]),
    },
    {
      key: "delete",
      label: FileOperations.Delete,
      icon: <DeleteOutlined />,
      // PopConfirm does not work in either the function or label field here
      clickFunction: (event, record: MineDocument) => openDeleteModal(event, [record]),
    },
  ].filter((action) => allowedTableActions[action.label]);

  const filterActions = (record: MineDocument, tableActions: ITableAction[]) => {
    const allowedDocumentActions: string[] = record.allowed_actions;
    return tableActions.filter((action) => allowedDocumentActions.includes(action.label));
  };

  // document tables that don't yet have MineRecord, actions, archive, versions functionality
  const oldGetColumns = () => {
    let columns = documentColumns ?? [
      documentNameColumn("document_name", "File Name", isMinimalView),
      renderTextColumn("category", "Category", !isMinimalView),
      uploadDateColumn("upload_date", "Uploaded", !isMinimalView),
      uploadDateColumn("dated", "Dated", !isMinimalView),
    ];
    if (actions.length > 0 && !columns.some((column) => column.key === "actions")) {
      columns.push(renderActionsColumn(actions, filterActions));
    }
    if (!some(documents, "dated")) {
      columns = columns.filter((column) => column.key !== "dated");
    }

    if (excludedColumnKeys?.length > 0) {
      columns = columns.filter((column) => !excludedColumnKeys.includes(column.key.toString()));
    }
    return columns;
  };

  const newGetColumns = (): ColumnsType<MineDocument> => {
    const columns: ColumnsType<MineDocument> = [
      documentNameColumnNew(),
      ...additionalColumns,
      renderTextColumn("file_type", "File Type", !isMinimalView),
      uploadDateColumn("update_timestamp", "Last Modified"),
      uploadedByColumn("create_user", "Created By"),
    ];
    if (actions.length) {
      columns.push(renderActionsColumn(actions, filterActions, rowSelection.length > 0));
    }
    return columns;
  };

  let columns: ColumnsType<MineDocument> = showVersionHistory ? newGetColumns() : oldGetColumns();

  if (additionalColumnProps?.length > 0) {
    additionalColumnProps.forEach((addColumn) => {
      const columnIndex = columns.findIndex((column) => addColumn?.key === column.key);
      if (columnIndex >= 0) {
        columns[columnIndex] = { ...columns[columnIndex], ...addColumn?.colProps };
      }
    });
  }

  if (defaultSortKeys.length > 0) {
    columns = columns.map((column) => {
      const isDefaultSort = defaultSortKeys.includes(column.key.toString());
      return isDefaultSort ? { defaultSortOrder: "descend", ...column } : column;
    });
  }

  const minimalProps = isMinimalView
    ? { size: "small" as SizeType, rowClassName: "ant-table-row-minimal" }
    : null;

  const handleRowSelectionChange = (value) => {
    if (documentTypeCode === "") {
      setDocumentTypeCode(value[0].major_mine_application_document_type_code);
    }

    setRowSelection(value);
  };

  const handleCloseCompressionNotification = () => {
    progressRef.current = false;
    setReadyForDownloadModalVisible(false);
    notification.close(documentTypeCode);
    setCompressionProgressVisible(false);
    setCompressionProgress(0);
  };

  const startFilesCompression = () => {
    setBeginCompressionModalVisible(false);
    notification.warning({
      key: documentTypeCode,
      className: `progressNotification-${documentTypeCode}`,
      message: "Compressing...",
      description: "Preparing files for download",
      duration: 0,
      placement: "topRight",
      onClose: handleCloseCompressionNotification,
      top: 85,
    });

    const mineGuid = rowSelection[0].mine_guid;
    const documentManagerGuids = rowSelection
      .filter((row) => row.is_latest_version)
      .map((filteredRows) => filteredRows.document_manager_guid);

    setEntityTitle(rowSelection[0].entity_title);
    if (documentManagerGuids.length === 0) {
      setTimeout(() => {
        notification.warning({
          key: documentTypeCode,
          className: `progressNotification-${documentTypeCode}`,
          message: "Error starting file compression",
          description:
            "Only archived files or previous document versions were selected. To download \
          them you must go to the archived documents view or download them individually.",
          duration: 15,
          placement: "topRight",
          onClose: handleCloseCompressionNotification,
          top: 85,
        });
      }, 2000);
    } else {
      props.documentsCompression(mineGuid, documentManagerGuids).then((response) => {
        const taskId = response.data && response.data.task_id ? response.data.task_id : null;
        if (!taskId) {
          setTimeout(() => {
            notification.warning({
              key: documentTypeCode,
              className: `progressNotification-${documentTypeCode}`,
              message: "Error starting file compression",
              description: "An invalid task id was provided",
              duration: 10,
              placement: "topRight",
              onClose: handleCloseCompressionNotification,
              top: 85,
            });
          }, 2000);
        } else {
          const documentTypeIdentifier = `.progressNotification-${documentTypeCode}`;
          const notificationElement = document.querySelector(documentTypeIdentifier);
          const notificationPosition = notificationElement.getBoundingClientRect();
          setNotificationTopPosition(notificationPosition.top);
          progressRef.current = true;
          setCompressionProgressVisible(true);
          const poll = async () => {
            const { data } = await props.pollDocumentsCompressionProgress(taskId);
            if (data.progress) {
              setCompressionProgress(data.progress);
            }

            if (data.state !== "SUCCESS" && progressRef.current) {
              setTimeout(poll, 2000);
            } else {
              setFileToDownload(data.success_docs[0]);
              setReadyForDownloadModalVisible(true);
            }
          };

          poll();
        }
      });
    }
  };

  const bulkItems: MenuProps["items"] = [
    {
      key: "0",
      icon: <DownloadOutlined />,
      label: (
        <button
          type="button"
          className="full add-permit-dropdown-button"
          onClick={() => {
            setBeginCompressionModalVisible(true);
          }}
        >
          <div>Download File(s)</div>
        </button>
      ),
    },
  ];

  const rowSelectionObject = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      handleRowSelectionChange(selectedRows);
    },
  };

  const renderBulkActions = () => {
    let element = (
      <Button
        className="ant-btn ant-btn-primary"
        disabled={rowSelection.length === 0 || isCompressionProgressVisible}
        onClick={() => {
          setBeginCompressionModalVisible(true);
        }}
      >
        <div>Download</div>
      </Button>
    );
    if (documentsCanBulkDropDown) {
      element = (
        <Dropdown
          menu={{ items: bulkItems }}
          placement="bottomLeft"
          disabled={rowSelection.length === 0 || isCompressionProgressVisible}
        >
          <Button className="ant-btn ant-btn-primary">
            Action
            <DownOutlined />
          </Button>
        </Dropdown>
      );
    }

    return enableBulkActions && <div style={{ float: "right" }}>{element}</div>;
  };

  const renderCoreTable = () => {
    let element = (
      <CoreTable
        columns={columns}
        {...(enableBulkActions
          ? {
              rowSelection: {
                type: "checkbox",
                ...rowSelectionObject,
              },
            }
          : {})}
        dataSource={documents}
        {...minimalProps}
      />
    );

    if (showVersionHistory) {
      element = (
        <div>
          <BeginCompressionModal
            isModalVisible={isBeginCompressionModalVisible}
            filesCompression={startFilesCompression}
            setModalVisible={setBeginCompressionModalVisible}
          />
          {isCompressionProgressVisible && (
            <CompressionNotificationProgressBar
              compressionProgress={compressionProgress}
              notificationTopPosition={notificationTopPosition}
            />
          )}
          <CompressedFilesDownloadModal
            isModalVisible={isReadyForDownloadModalVisible}
            closeCompressNotification={handleCloseCompressionNotification}
            documentManagerGuid={fileToDownload}
            entityTitle={entityTitle}
          />
          <CoreTable
            condition={isLoaded}
            dataSource={documents}
            columns={columns}
            {...(enableBulkActions
              ? {
                  rowSelection: {
                    type: "checkbox",
                    ...rowSelectionObject,
                  },
                }
              : {})}
            expandProps={{
              childrenColumnName: "versions",
              matchChildColumnsToParent: true,
              recordDescription: "version history",
              rowExpandable: (record) => record.number_prev_versions > 0,
            }}
          />
        </div>
      );
    }

    return element;
  };

  return (
    <div>
      {renderBulkActions()}
      {renderCoreTable()}
    </div>
  );
};

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

// eslint-disable-next-line @typescript-eslint/no-shadow
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      archiveMineDocuments,
      openDocument,
      documentsCompression,
      pollDocumentsCompressionProgress,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentTable);
