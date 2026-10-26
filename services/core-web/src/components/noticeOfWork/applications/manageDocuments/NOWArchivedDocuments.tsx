import React, { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import { Typography } from "antd";
import * as Strings from "@mds/common/constants/strings";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { NoWApplicationDocument } from "@mds/common/models/documents/document";
import { INoWDocument } from "@mds/common/interfaces/NoWDocument.interface";
import { getNoticeOfWorkApplicationDocumentTypeOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";

/*
Files archived from the Permit Package, Application Documents and Government Documents tables, shown the same way as
Major Projects' Archived Documents. Archived files can only be viewed and downloaded.
*/

// An archived vFCBC file, only the fields used here are typed
interface IArchivedSubmissionDocument {
  document_name?: string;
  filename?: string;
  documenttype?: string;
  [key: string]: any;
}

interface IArchivedDocumentsNoticeOfWork {
  mine_guid: string;
  archived_documents?: INoWDocument[];
  archived_submission_documents?: IArchivedSubmissionDocument[];
}

interface NOWArchivedDocumentsProps {
  noticeOfWork: IArchivedDocumentsNoticeOfWork;
}

// "From" is the document category the file was archived from
const fromColumn = renderTextColumn("category", "From", true);

export const toArchivedDocuments = (
  noticeOfWork: IArchivedDocumentsNoticeOfWork,
  documentTypeOptionsHash: Record<string, string>
): NoWApplicationDocument[] => {
  const coreDocuments = (noticeOfWork.archived_documents ?? []).map(
    (doc) =>
      new NoWApplicationDocument({
        ...doc,
        ...doc.mine_document,
        document_name: doc.mine_document?.document_name || Strings.EMPTY_FIELD,
        category: documentTypeOptionsHash?.[doc.now_application_document_type_code],
      })
  );
  const submissionDocuments = (noticeOfWork.archived_submission_documents ?? []).map(
    (doc) =>
      new NoWApplicationDocument({
        ...doc,
        // A replaced vFCBC file keeps its original filename, document_name is its current name
        document_name: doc.document_name || doc.filename || Strings.EMPTY_FIELD,
        mine_guid: noticeOfWork.mine_guid,
        is_imported_submission_document: true,
        category: doc.documenttype,
      })
  );
  return [...coreDocuments, ...submissionDocuments];
};

export const NOWArchivedDocuments: FC<NOWArchivedDocumentsProps> = (props) => {
  const documentTypeOptionsHash = useSelector(getNoticeOfWorkApplicationDocumentTypeOptionsHash);
  const documents = useMemo(
    () => toArchivedDocuments(props.noticeOfWork, documentTypeOptionsHash),
    [props.noticeOfWork, documentTypeOptionsHash]
  );

  return (
    <>
      <Typography.Paragraph>
        Files archived from the Permit Package, Application Documents and Government Documents
        tables
      </Typography.Paragraph>
      <DocumentTable
        documents={documents}
        showVersionHistory
        canReplaceDocuments={false}
        additionalColumns={[fromColumn]}
      />
    </>
  );
};

export default NOWArchivedDocuments;
