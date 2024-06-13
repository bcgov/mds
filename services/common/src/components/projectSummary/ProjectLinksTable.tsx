import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { ColumnsType } from "antd/es/table";
import FileOutlined from "@ant-design/icons/FileOutlined";

import CoreTable from "@mds/common/components/common/CoreTable";
import { ILinkedProject } from "@mds/common/interfaces";
import {
  ITableAction,
  renderActionsColumn,
  renderDateColumn,
  renderTextColumn,
} from "../common/CoreTableCommonColumns";
import { deleteProjectLink } from "@mds/common/redux/actionCreators/projectActionCreator";
import { deleteConfirmWrapper } from "../common/ActionMenu";

interface IProjectLinksTableProps {
  projectLinks: ILinkedProject[];
  viewProject: (record: ILinkedProject) => string;
  projectGuid: string;
  hasModifyPermission: boolean;
  isLoaded: boolean;
}

const ProjectLinksTable: React.FC<IProjectLinksTableProps> = ({
  projectLinks,
  viewProject,
  projectGuid,
  hasModifyPermission,
  isLoaded,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const removeProjectLink = (projectLinkGuid) => {
    dispatch(deleteProjectLink(projectGuid, projectLinkGuid));
  };

  const actions: ITableAction[] = [
    {
      key: "view",
      label: "View Project",
      icon: <FileOutlined />,
      clickFunction: (_event, record: ILinkedProject) => {
        history.push(viewProject(record));
      },
    },
  ];
  const deleteAction = {
    key: "remove",
    label: "Remove Linked-project",
    icon: <FileOutlined />,
    clickFunction: (_event, record: ILinkedProject) => {
      deleteConfirmWrapper("Project Link", () => removeProjectLink(record.project_link_guid));
    },
  };
  if (hasModifyPermission) {
    actions.push(deleteAction);
  }

  const columns: ColumnsType<ILinkedProject> = [
    renderTextColumn("project_title", "Project Title", true),
    renderTextColumn("proponent_project_id", "Project #", true),
    renderTextColumn("status_description", "Status", true),
    renderTextColumn("primary_contact", "Contact", true),
    renderDateColumn("update_timestamp", "Last Updated", true),
    renderActionsColumn({ actions }),
  ];

  return (
    <CoreTable
      dataSource={projectLinks}
      columns={columns}
      condition={isLoaded}
      rowKey="project_link_guid"
    />
  );
};

export default ProjectLinksTable;
