import React from "react";

import CoreTable from "@mds/common/components/common/CoreTable";
import { ILinkedProject } from "@mds/common/interfaces";
import { ColumnsType } from "antd/es/table";

interface IProjectLinksTableProps {
  linkedProjects: ILinkedProject[];
  tableColumns: ColumnsType<ILinkedProject>;
}

const ProjectLinksTable: React.FC<IProjectLinksTableProps> = ({ linkedProjects, tableColumns }) => {
  const coreTableProps = {
    dataSource: linkedProjects,
    columns: tableColumns,
  };

  return <CoreTable {...coreTableProps} />;
};

export default ProjectLinksTable;
