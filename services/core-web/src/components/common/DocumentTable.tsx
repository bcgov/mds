import React, { FC, useEffect, useState } from "react";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  documentNameColumn,
  documentNameColumnNew,
  uploadDateColumn,
  uploadedByColumn,
} from "./DocumentColumns";
import {
  ITableAction,
  renderActionsColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { some } from "lodash";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import DocumentCompression from "@mds/common/components/documents/DocumentCompression";
import { archiveMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import { useDispatch, useSelector } from "react-redux";
import { modalConfig } from "@/components/modalContent/config";
import { Feature } from "@mds/common";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { ColumnsType } from "antd/es/table";
import { FileOperations, MineDocument } from "@mds/common/models/documents/document";
import {
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  FileOutlined,
  InboxOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { openDocument } from "../syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { Button, Dropdown, MenuProps } from "antd";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import DocumentTableProps from "@mds/common/interfaces/document/documentTableProps.interface";

export const DocumentTable: FC<DocumentTableProps> = ({
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
  removeDocument,
  replaceAlertMessage = "The replaced file will not reviewed as part of the submission.  The new file should be in the same format as the original file.",
  ...props
}: DocumentTableProps) => {
  const dispatch = useDispatch();
  const userRoles = useSelector(getUserAccessData);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const [rowSelection, setRowSelection] = useState([]);
  const [isCompressionModal, setCompressionModal] = useState(false);
  const [isCompressionInProgress, setCompressionInProgress] = useState(false);
  const [documentsCanBulkDropDown, setDocumentsCanBulkDropDown] = useState(false);
  const { isFeatureEnabled } = useFeatureFlag();

  const allowedTableActions = {
    [FileOperations.View]: true,
    [FileOperations.Download]: true, // don't allow changes to version history where history is not shown
    [FileOperations.Replace]: !isViewOnly && showVersionHistory,
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
      doc.setAllowedActions(userRoles);
      return doc;
    });
  };

  const [documents, setDocuments] = useState<MineDocument[]>(parseDocuments(props.documents ?? []));

  useEffect(() => {
    const isBulkArchive = documents.every((doc) =>
      doc.allowed_actions.find((a) => a === FileOperations.Archive)
    );

    setDocumentsCanBulkDropDown(isBulkArchive);
  }, []);

  useEffect(() => {
    setDocuments(parseDocuments(props.documents ?? []));
  }, [props.documents]);

  const openArchiveModal = (event, docs: MineDocument[]) => {
    const mineGuid = docs[0].mine_guid;
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          title: `Archive ${docs?.length > 1 ? "Multiple Files" : "File"}`,
          closeModal: handleCloseModal,
          handleSubmit: async () => {
            await dispatch(
              archiveMineDocuments(
                mineGuid,
                docs.map((d) => d.mine_document_guid)
              )
            );
            if (props.onArchivedDocuments) {
              props.onArchivedDocuments(docs);
            }
          },
          documents: docs,
        },
        content: modalConfig.ARCHIVE_DOCUMENT,
      })
    );
  };

  const openDeleteModal = (event, docs: MineDocument[]) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          DocumentTable,
          title: `Delete ${docs?.length > 1 ? "Multiple Files" : "File"}`,
          closeModal: handleCloseModal,
          handleSubmit: async () => {
            for (const doc of docs) {
              await removeDocument(event, doc.key, documentParent);
            }
            handleCloseModal();
          },
          documents: docs,
        },

        content: modalConfig.DELETE_DOCUMENT,
      })
    );
  };

  const openReplaceModal = (event, doc: MineDocument) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          title: `Replace File`,
          closeModal: handleCloseModal,
          handleSubmit: async (document: MineDocument) => {
            const newDocuments = documents.map((d) =>
              d.mine_document_guid === document.mine_document_guid ? document : d
            );
            setDocuments(newDocuments);
          },
          document: doc,
          alertMessage: replaceAlertMessage,
        },
        content: modalConfig.REPLACE_DOCUMENT,
      })
    );
  };

  const actions = [
    {
      key: "view",
      label: FileOperations.View,
      icon: <FileOutlined />,
      clickFunction: (_event, record: MineDocument) =>
        dispatch(openDocument(record.document_manager_guid, record.mine_document_guid)),
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
      clickFunction: (_event, _record: MineDocument) => openReplaceModal(_event, _record),
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
      icon: <DeleteOutlined />, // PopConfirm does not work in either the function or label field here
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
      columns.push(renderActionsColumn({ actions, recordActionsFilter: filterActions }));
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
      columns.push(
        renderActionsColumn({
          actions,
          recordActionsFilter: filterActions,
          isRowSelected: rowSelection.length > 0,
        })
      );
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

  const bulkItems: MenuProps["items"] = [
    {
      key: "0",
      icon: <DownloadOutlined />,
      label: (
        <button
          type="button"
          className="full add-permit-dropdown-button"
          onClick={() => {
            setCompressionModal(true);
          }}
        >
          <div>Download File(s)</div>
        </button>
      ),
    },
    {
      key: "1",
      icon: <InboxOutlined />,
      label: (
        <button
          type="button"
          className="full add-permit-dropdown-button"
          onClick={(e) => {
            openArchiveModal(e, rowSelection);
          }}
        >
          <div>Archive File(s)</div>
        </button>
      ),
    },
  ];

  const renderBulkActions = () => {
    let element = (
      <Button
        className="ant-btn ant-btn-primary"
        disabled={rowSelection.length === 0 || isCompressionInProgress}
        onClick={() => {
          setCompressionModal(true);
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
          disabled={rowSelection.length === 0 || isCompressionInProgress}
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

  const handleRowSelectionChange = (value) => {
    setRowSelection(value);
  };

  const rowSelectionObject: any = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      handleRowSelectionChange(selectedRows);
    },
  };

  const bulkActionsProps = enableBulkActions
    ? {
        rowSelection: {
          type: "checkbox",
          ...rowSelectionObject,
        },
      }
    : {};

  const versionProps = showVersionHistory
    ? {
        expandProps: {
          childrenColumnName: "versions",
          matchChildColumnsToParent: true,
          recordDescription: "version history",
          rowExpandable: (record) => record.number_prev_versions > 0,
        },
      }
    : {};

  const coreTableProps = {
    condition: isLoaded,
    dataSource: documents,
    columns: columns,
    ...bulkActionsProps,
    ...versionProps,
    ...minimalProps,
  };

  return (
    <div>
      <DocumentCompression
        documentType={""}
        rows={rowSelection}
        setCompressionModalVisible={setCompressionModal}
        isCompressionModalVisible={isCompressionModal}
        compressionInProgress={setCompressionInProgress}
        showDownloadWarning={showVersionHistory || canArchiveDocuments}
      />
      {renderBulkActions()}
      {<CoreTable {...coreTableProps} />}
    </div>
  );
};

export default DocumentTable;
