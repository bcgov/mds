import React, { FC } from "react";
import { IMineDocument } from "../..";
import DocumentTable from "../documents/DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";

interface ReportFilesTableProps {
  documents: IMineDocument[];
}
export const ReportFilesTable: FC<ReportFilesTableProps> = ({ documents = [] }) => {
  return (
    <DocumentTable
      documents={documents.map((doc) => new MineDocument(doc))}
      documentParent={"Report Submission"}
      showVersionHistory
      isViewOnly
    />
  );
};

export default ReportFilesTable;
