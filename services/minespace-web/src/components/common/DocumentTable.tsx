import React from "react";
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
import { getUserInfo } from "@common/selectors/authenticationSelectors";

interface DocumentTableProps {
  documents: MineDocument[];
  isLoaded: boolean;
  isViewOnly: boolean;
  canArchiveDocuments: boolean;
  showVersionHistory: boolean;
  documentParent: string;
  view: string;
  openModal: (arg) => void;
  openDocument: any;
  closeModal: () => void;
  removeDocument: (event, doc_guid: string, mine_guid: string) => void;
  archiveMineDocuments: (mineGuid: string, mineDocumentGuids: string[], entityType: string) => void;
  onArchivedDocuments: (docs?: MineDocument[]) => void;
  documentColumns: ColumnType<unknown>[];
  additionalColumns: ColumnType<MineDocument>[];
  defaultSortKeys: string[];
  excludedColumnKeys: string[];
  additionalColumnProps: { key: string; colProps: any }[];
  fileOperationPermissionMap: { operation: FileOperations; permission: string | boolean }[];
  userInfo: any;
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
  defaultSortKeys = ["upload_date", "dated", "update_timestamp"],
  view = "standard",
  canArchiveDocuments = false,
  openModal,
  closeModal,
  removeDocument,
  openDocument,
  ...props
}: DocumentTableProps) => {
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
      // TODO: getUserAccessData is broken, but the correct function to use here
      const { client_roles = [] } = props.userInfo;
      doc.setAllowedActions(client_roles);
      return doc;
    });
  };
  const documents = parseDocuments(props.documents ?? []);

  const openArchiveModal = (event, docs: MineDocument[]) => {
    const mineGuid = docs[0].mine_guid;
    event.preventDefault();
    const entityType = docs[0].entity_type;
    openModal({
      props: {
        title: `Archive ${docs?.length > 1 ? "Multiple Files" : "File"}`,
        closeModal: closeModal,
        handleSubmit: async () => {
          await props.archiveMineDocuments(
            mineGuid,
            docs.map((d) => d.mine_document_guid),
            entityType
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
      columns.push(renderActionsColumn(actions, filterActions));
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
  return showVersionHistory ? (
    <CoreTable
      condition={isLoaded}
      dataSource={documents}
      columns={columns}
      expandProps={{
        childrenColumnName: "versions",
        matchChildColumnsToParent: true,
        recordDescription: "version history",
        rowExpandable: (record) => record.number_prev_versions > 0,
      }}
    />
  ) : (
    <CoreTable columns={columns} dataSource={documents} {...minimalProps} />
  );
};

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
});

// eslint-disable-next-line @typescript-eslint/no-shadow
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      archiveMineDocuments,
      openDocument,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentTable);
