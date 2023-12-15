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
      file_name: "Report 1",
      "file_type ": "PDF",
      created_by: "admin",
    },
  ];

  function transformRowData() {
    return { ...files };
  }

  return <CoreTable size={"small"} columns={tableColumns} rowKey="1" dataSource={files} />;
};

export default ReportFilesTable;
