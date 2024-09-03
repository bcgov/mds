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
import { Feature } from "@mds/common/utils/featureFlag";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { ColumnsType } from "antd/es/table";
import { FileOperations, MineDocument } from "@mds/common/models/documents/document";

import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import DownOutlined from "@ant-design/icons/DownOutlined";
import FileOutlined from "@ant-design/icons/FileOutlined";
import InboxOutlined from "@ant-design/icons/InboxOutlined";
import SyncOutlined from "@ant-design/icons/SyncOutlined";
import { openDocument } from "@mds/common/components/syncfusion/DocumentViewer";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { Button, Dropdown, MenuProps } from "antd";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import DocumentTableProps from "@mds/common/interfaces/document/documentTableProps.interface";
import ArchiveDocumentModal from "./ArchiveDocumentModal";
import DeleteDocumentModal from "./DeleteDocumentModal";
import ReplaceDocumentModal from "./ReplaceDocumentModal";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";

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
  // differences from bringing over from CORE (vs the MS version): this file has doc compression & bulk actions
  const dispatch = useDispatch();
  const userRoles = useSelector(getUserAccessData);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const [rowSelection, setRowSelection] = useState([]);
  const [isCompressionModal, setIsCompressionModal] = useState(false);
  const [isCompressionInProgress, setIsCompressionInProgress] = useState(false);
  const [documentsCanBulkDropDown, setDocumentsCanBulkDropDown] = useState(false);
  const { isFeatureEnabled } = useFeatureFlag();

  const allowedTableActions = {
    [FileOperations.View]: true,
    [FileOperations.Download]: true,
    // don't allow changes to version history where history is not shown
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
          handleSubmit: async () => {
            await dispatch(
              archiveMineDocuments(
                mineGuid,
                docs.map((d) => d.mine_document_guid)
              )
            );
            if (props.onArchivedDocuments) {
              await props.onArchivedDocuments(docs);
            }
            handleCloseModal();
          },
          documents: docs,
        },
        content: ArchiveDocumentModal,
      })
    );
  };

  const openDeleteModal = (event, docs: MineDocument[]) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          title: `Delete ${docs?.length > 1 ? "Multiple Files" : "File"}`,
          handleSubmit: async () => {
            await Promise.all(docs.map((doc) => removeDocument(event, doc.key, documentParent)));
            handleCloseModal();
          },
          documents: docs,
        },
        content: DeleteDocumentModal,
      })
    );
  };

  const openReplaceModal = (event, doc: MineDocument) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          title: `Replace File`,
          handleSubmit: async (document: MineDocument) => {
            const newDocuments = documents.map((d) =>
              d.mine_document_guid === document.mine_document_guid ? document : d
            );
            setDocuments(newDocuments);
          },
          document: doc,
          alertMessage: replaceAlertMessage,
        },
        content: ReplaceDocumentModal,
      })
    );
  };

  const actions = [
    {
      key: "view",
      label: FileOperations.View,
      icon: <FileOutlined />,
      clickFunction: (_event, record: MineDocument) =>
        dispatch(openDocument(record.document_manager_guid, record.document_name)),
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
      key: FileOperations.Download,
      icon: <DownloadOutlined />,
      label: (
        <button
          type="button"
          className="full add-permit-dropdown-button"
          onClick={() => {
            setIsCompressionModal(true);
          }}
        >
          <div>Download File(s)</div>
        </button>
      ),
    },
    {
      key: FileOperations.Archive,
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
  ].filter((a) => allowedTableActions[a.key]);

  const renderBulkActions = () => {
    let element = (
      <Button
        className="ant-btn ant-btn-primary"
        disabled={rowSelection.length === 0 || isCompressionInProgress}
        onClick={() => {
          setIsCompressionModal(true);
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
    rowKey: "document_manager_guid",
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
        mineDocuments={rowSelection}
        setCompressionModalVisible={setIsCompressionModal}
        isCompressionModalVisible={isCompressionModal}
        setCompressionInProgress={setIsCompressionInProgress}
        showDownloadWarning={showVersionHistory || canArchiveDocuments}
      />
      {renderBulkActions()}
      {<CoreTable {...coreTableProps} />}
    </div>
  );
};

export default DocumentTable;
