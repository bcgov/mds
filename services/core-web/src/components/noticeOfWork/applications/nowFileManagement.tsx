import React, { ComponentType } from "react";
import { isEmpty } from "lodash";
import { DownloadOutlined, FileOutlined, InboxOutlined, SyncOutlined } from "@ant-design/icons";
import { NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD } from "@mds/common/constants/API";
import { FileOperations, NoWApplicationDocument } from "@mds/common/models/documents/document";
import { IPermitCondition } from "@mds/common/interfaces";
import { renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";
import ArchiveDocumentModal from "@mds/common/components/documents/ArchiveDocumentModal";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { isFileReferencedInConditions } from "@mds/common/utils/permitPackageDocuments";

/*
Replace, Archive and version history for the NoW Manage Documents tables (Permit Package, Application Documents
and Government Documents), shared so the tables behave the same.
*/

// A row in one of the Manage Documents tables. The tables build their rows in JS, so only the fields used here are typed.
export interface IFileManagementRecord {
  mine_document_guid?: string;
  mine_document_version_guid?: string;
  now_application_document_xref_guid?: string;
  now_application_document_sub_type_code?: string;
  document_manager_guid?: string;
  document_manager_version_guid?: string;
  document_name?: string;
  filename?: string;
  is_final_package?: boolean;
  number_prev_versions?: number;
  allowed_actions?: string[];
  mine_document?: Record<string, unknown>;
  [key: string]: any;
}

export interface IFileManagementContext {
  now_application_status_code: string;
  is_delayed: boolean;
  is_view_mode: boolean;
  user_roles: string[];
}

type OpenModal = (modal: { props: Record<string, unknown>; content: ComponentType<any> }) => void;

// Previous versions of a file are shown as child rows of the current one
export const isVersionRow = (record: IFileManagementRecord): boolean =>
  Boolean(record.mine_document_version_guid);

// Matches Major Projects: the expand icon sits beside the file name, so names are offset to line up with each other
export const FILE_MANAGEMENT_ROW_CLASS = "table-row-align-middle no-sub-table-expandable-rows";
// The header is offset with a class, a non-text title would leave the sort button without an accessible name
export const fileNameHeaderCell = () => ({ className: "file-name-header--offset" });
// Files without versions get documentWithTag's 38px, so previous versions (not wrapped in it) match that, and files with versions add 14px to the icon
export const getFileNameOffset = (record: IFileManagementRecord): { marginLeft?: string } => {
  if (isVersionRow(record)) {
    return { marginLeft: "38px" };
  }
  return record.number_prev_versions > 0 ? { marginLeft: "14px" } : {};
};

// What the NoWApplicationDocument model needs, on top of the row itself, to work out a row's allowed actions
export const getFileManagementContext = ({
  noticeOfWork,
  applicationDelay,
  isViewMode,
  userRoles,
}: {
  noticeOfWork: { now_application_status_code: string };
  applicationDelay: unknown;
  isViewMode: boolean;
  userRoles: string[];
}): IFileManagementContext => ({
  now_application_status_code: noticeOfWork.now_application_status_code,
  is_delayed: !isEmpty(applicationDelay),
  is_view_mode: isViewMode,
  user_roles: userRoles,
});

// Wraps a table row in a NoWApplicationDocument, which works out the row's allowed actions and its version rows
export const toFileManagementRow = (
  row: IFileManagementRecord,
  fileManagementContext: IFileManagementContext
): NoWApplicationDocument & IFileManagementRecord => {
  // document_name uses the row's filename, which falls back to a placeholder when the file has no name
  const document = new NoWApplicationDocument({
    ...row,
    ...row.mine_document,
    document_name: row.filename,
    ...fileManagementContext,
  });
  // vFCBC rows also carry the raw versions from the API, keep the model's version rows (with their allowed actions) instead
  return Object.assign(document, row, { versions: document.versions });
};

// The Manage Documents table a file lives in, permit package files also live in one of these
const getFileSectionName = (record: IFileManagementRecord) =>
  record.now_application_document_sub_type_code === "GDO"
    ? "Government Documents"
    : "Application Documents";

export const getArchivePermitPackageWarning = (
  record: IFileManagementRecord,
  conditions: IPermitCondition[]
): string | undefined => {
  if (!record.is_final_package) {
    return undefined;
  }
  const isReferenced = isFileReferencedInConditions(
    conditions,
    record.now_application_document_xref_guid
  );
  return isReferenced
    ? "This file is in the permit package and is currently being referenced in a permit condition. Archiving it will remove it from the permit package and break that reference."
    : "This file is in the permit package. Archiving it will remove it from the permit package.";
};

export const openReplaceFileModal = ({
  record,
  applicationGuid,
  openModal,
  createNoticeOfWorkDocumentVersion,
  onReplaced,
}: {
  record: IFileManagementRecord;
  applicationGuid: string;
  openModal: OpenModal;
  createNoticeOfWorkDocumentVersion: (
    applicationGuid: string,
    mineDocumentGuid: string,
    documentManagerVersionGuid: string
  ) => Promise<unknown>;
  onReplaced: () => unknown;
}) =>
  openModal({
    props: {
      title: "Replace File",
      document: record,
      alertMessage:
        "The new file must be the same file type as the original. The current file will be kept as a previous version, which can be viewed or downloaded from this table.",
      uploadUrl: NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD(applicationGuid, record.mine_document_guid),
      createVersion: (documentManagerVersionGuid: string) =>
        createNoticeOfWorkDocumentVersion(
          applicationGuid,
          record.mine_document_guid,
          documentManagerVersionGuid
        ),
      handleSubmit: onReplaced,
    },
    content: ReplaceDocumentModal,
  });

export const openArchiveFileModal = ({
  record,
  applicationGuid,
  conditions,
  openModal,
  closeModal,
  archiveNoticeOfWorkDocuments,
  onArchived,
}: {
  record: IFileManagementRecord;
  applicationGuid: string;
  conditions: IPermitCondition[];
  openModal: OpenModal;
  closeModal: () => void;
  archiveNoticeOfWorkDocuments: (
    applicationGuid: string,
    mineDocumentGuids: string[]
  ) => Promise<unknown>;
  onArchived: () => unknown;
}) =>
  openModal({
    props: {
      title: "Archive File",
      documents: [record],
      alertMessage: "This action cannot be undone",
      alertDescription: `Archiving removes this file from ${getFileSectionName(
        record
      )}. You can find it and its previous versions, in Archived Documents.`,
      extraWarning: getArchivePermitPackageWarning(record, conditions),
      handleSubmit: async () => {
        try {
          await archiveNoticeOfWorkDocuments(applicationGuid, [record.mine_document_guid]);
        } catch (err) {
          // The action creator has already surfaced the error; keep the modal open so the user can retry.
          return;
        }
        await onArchived();
        closeModal();
      },
    },
    content: ArchiveDocumentModal,
  });

export const fileManagementActionsColumn = ({
  openDocument,
  onReplace,
  onArchive,
}: {
  openDocument: (
    documentManagerGuid: string,
    documentName: string,
    mineDocumentGuid: string | null,
    documentManagerVersionGuid: string | null
  ) => unknown;
  onReplace: (record: IFileManagementRecord) => unknown;
  onArchive: (record: IFileManagementRecord) => unknown;
}) =>
  renderActionsColumn({
    actions: [
      {
        key: "view",
        label: FileOperations.View,
        icon: <FileOutlined />,
        clickFunction: (_event, record: IFileManagementRecord) =>
          openDocument(
            record.document_manager_guid,
            record.document_name,
            null,
            isVersionRow(record) ? record.document_manager_version_guid : null
          ),
      },
      {
        key: "download",
        label: FileOperations.Download,
        icon: <DownloadOutlined />,
        clickFunction: (_event, record: IFileManagementRecord) =>
          downloadFileFromDocumentManager(record),
      },
      {
        key: "replace",
        label: FileOperations.Replace,
        icon: <SyncOutlined />,
        clickFunction: (_event, record: IFileManagementRecord) => onReplace(record),
      },
      {
        key: "archive",
        label: FileOperations.Archive,
        icon: <InboxOutlined />,
        clickFunction: (_event, record: IFileManagementRecord) => onArchive(record),
      },
    ],
    recordActionsFilter: (record: IFileManagementRecord, actions) =>
      actions.filter((action) => record.allowed_actions?.includes(action.label)),
  });
