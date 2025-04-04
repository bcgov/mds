import React, { FC } from "react";
import DocumentTable from "../documents/DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { IMineDocument } from "@mds/common/interfaces/mineDocument.interface";

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
