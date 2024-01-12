import React, { FC } from "react";

import { IDocument, IMineReport, IMineReportSubmission } from "../..";
import DocumentTable from "../common/DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";

interface ReportFilesTableProps {
  report: IMineReport;
}
export const ReportFilesTable: FC<ReportFilesTableProps> = ({ report }) => {
  const documents =
    report?.mine_report_submissions?.reduce(
      (acc: IDocument[], submission: IMineReportSubmission) => {
        return acc.concat(submission.documents);
      },
      []
    ) ?? [];

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
