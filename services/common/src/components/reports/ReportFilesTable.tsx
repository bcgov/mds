import React, { FC } from "react";

import { IMineReport, getLatestReportSubmission } from "../..";
import DocumentTable from "../documents/DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";

interface ReportFilesTableProps {
  report: IMineReport;
}
export const ReportFilesTable: FC<ReportFilesTableProps> = ({ report }) => {
  const latestSubmission = getLatestReportSubmission(report);
  const documents = latestSubmission?.documents ?? [];

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
