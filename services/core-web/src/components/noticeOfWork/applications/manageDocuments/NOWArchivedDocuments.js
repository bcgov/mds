import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Typography } from "antd";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@mds/common/constants/strings";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { NoWApplicationDocument } from "@mds/common/models/documents/document";
import { getNoticeOfWorkApplicationDocumentTypeOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";

/*
Files archived from the Permit Package, Application Documents and Government Documents tables, shown the same way as
Major Projects' Archived Documents. Archived files can only be viewed and downloaded.
*/

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

// "From" is the document category the file was archived from
const fromColumn = renderTextColumn("category", "From", true);

export const toArchivedDocuments = (noticeOfWork, documentTypeOptionsHash) => {
  const coreDocuments = (noticeOfWork.archived_documents ?? []).map(
    (doc) =>
      new NoWApplicationDocument({
        ...doc,
        ...doc.mine_document,
        document_name: doc.mine_document.document_name || Strings.EMPTY_FIELD,
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

export const NOWArchivedDocuments = (props) => {
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
        openSelectedVersion
        additionalColumns={[fromColumn]}
      />
    </>
  );
};

NOWArchivedDocuments.propTypes = propTypes;

export default NOWArchivedDocuments;
