import React, { FC } from "react";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import {
  renderActionsColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { IMineDocument } from "../..";
import DocumentTable from "../common/DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";

interface ReportFilesTableProps {
  documents: IMineDocument[];
}
export const ReportFilesTable: FC<ReportFilesTableProps> = ({ documents }) => {
  const actions = [
    {
      key: "view",
      label: "View",
      clickFunction: () => {},
      icon: <EyeOutlined />,
    },
  ];

  const tableColumns = [
    renderTextColumn("file_name", "File Name", true),
    renderTextColumn("file_type", "File Type", true),
    renderTextColumn("created_by", "Created By", true),
    renderActionsColumn({ actions }),
  ];

  return (
    <DocumentTable
      documents={documents.map((doc) => new MineDocument(doc))}
      documentParent={"Report Submission"}
      documentColumns={tableColumns}
    />
  );
};

export default ReportFilesTable;
