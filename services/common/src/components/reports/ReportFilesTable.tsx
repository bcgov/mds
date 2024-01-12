import React, { FC } from "react";
import CoreTable from "@mds/common/components/common/CoreTable";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import {
  renderActionsColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";

export const ReportFilesTable: FC = () => {
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

  //Dummy data
  const files = [
    {
      document_manager_guid: "1",
      file_name: "Report 1",
      "file_type ": "PDF",
      created_by: "admin",
    },
  ];

  // TODO: Probably replace with DocumentTable
  return (
    <CoreTable
      size={"small"}
      columns={tableColumns}
      rowKey="document_manager_guid"
      dataSource={files}
    />
  );
};

export default ReportFilesTable;
