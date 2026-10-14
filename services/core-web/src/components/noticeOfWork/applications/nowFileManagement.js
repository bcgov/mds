import React from "react";
import { isEmpty } from "lodash";
import { DownloadOutlined, FileOutlined, InboxOutlined, SyncOutlined } from "@ant-design/icons";
import { NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD } from "@mds/common/constants/API";
import { FileOperations, NoWApplicationDocument } from "@mds/common/models/documents/document";
import { renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";
import ArchiveDocumentModal from "@mds/common/components/documents/ArchiveDocumentModal";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { isFileReferencedInConditions } from "@mds/common/utils/permitPackageDocuments";

/*
Replace, Archive and version history for the NoW Manage Documents tables (Permit Package, Application Documents
and Government Documents), shared so the tables behave the same.
*/

// Previous versions of a file are shown as child rows of the current one
export const isVersionRow = (record) => Boolean(record.mine_document_version_guid);

// What the NoWApplicationDocument model needs, on top of the row itself, to work out a row's allowed actions
export const getFileManagementContext = ({
  noticeOfWork,
  applicationDelay,
  isViewMode,
  userRoles,
}) => ({
  now_application_status_code: noticeOfWork.now_application_status_code,
  is_delayed: !isEmpty(applicationDelay),
  is_view_mode: isViewMode,
  user_roles: userRoles,
});

// Wraps a table row in a NoWApplicationDocument, which works out the row's allowed actions and its version rows
export const toFileManagementRow = (row, fileManagementContext) => {
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
const getFileSectionName = (record) =>
  record.now_application_document_sub_type_code === "GDO"
    ? "Government Documents"
    : "Application Documents";

export const getArchivePermitPackageWarning = (record, conditions) => {
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
}) =>
  openModal({
    props: {
      title: "Replace File",
      document: record,
      alertMessage:
        "The new file must be the same file type as the original. The current file will be kept as a previous version, which can be viewed or downloaded from this table.",
      uploadUrl: NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD(applicationGuid, record.mine_document_guid),
      createVersion: (documentManagerVersionGuid) =>
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

export const fileManagementActionsColumn = ({ openDocument, onReplace, onArchive }) =>
  renderActionsColumn({
    actions: [
      {
        key: "view",
        label: FileOperations.View,
        icon: <FileOutlined />,
        clickFunction: (_event, record) =>
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
        clickFunction: (_event, record) => downloadFileFromDocumentManager(record),
      },
      {
        key: "replace",
        label: FileOperations.Replace,
        icon: <SyncOutlined />,
        clickFunction: (_event, record) => onReplace(record),
      },
      {
        key: "archive",
        label: FileOperations.Archive,
        icon: <InboxOutlined />,
        clickFunction: (_event, record) => onArchive(record),
      },
    ],
    recordActionsFilter: (record, actions) =>
      actions.filter((action) => record.allowed_actions?.includes(action.label)),
  });
