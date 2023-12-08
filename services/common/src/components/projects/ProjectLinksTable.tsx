import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { ColumnsType } from "antd/es/table";
import FileOutlined from "@ant-design/icons/FileOutlined";

import CoreTable from "@mds/common/components/common/CoreTable";
import { ILinkedProject, IProject } from "@mds/common/interfaces";
import {
  ITableAction,
  renderActionsColumn,
  renderDateColumn,
  renderTextColumn,
} from "../common/CoreTableCommonColumns";
import { isProponent, getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { userHasRole } from "@mds/common/redux/reducers/authenticationReducer";
import { USER_ROLES, getStatusDescription } from "../..";

interface IProjectLinksTableProps {
  project: IProject;
  hasModifyPermission: boolean;
  isLoaded: boolean;
}

const ProjectLinksTable: React.FC<IProjectLinksTableProps> = ({
  project,
  hasModifyPermission,
  isLoaded,
}) => {
  const history = useHistory();
  const systemFlag = useSelector(getSystemFlag);

  const getLinkedProjects = (data: IProject): ILinkedProject[] => {
    return data.project_links.flatMap((link) => {
      const isSameProject = link.project.project_guid === data.project_guid;
      const isSameRelatedProject = link.related_project.project_guid === data.project_guid;

      const transformProject = (project) => ({
        ...project,
        status_code: getStatusDescription(
          project.project_summary.status_code,
          project.major_mine_application.status_code,
          project.information_requirements_table.status_code
        ),
        primary_contact: project.contacts.find((c: any) => c.name)?.name || "",
      });

      return [
        !isSameProject ? transformProject(link.project) : null,
        !isSameRelatedProject ? transformProject(link.related_project) : null,
      ].filter(Boolean) as ILinkedProject[];
    });
  };

  const actions = [
    {
      key: "view",
      label: "View Project",
      icon: <FileOutlined />,
      clickFunction: (_event, record: ILinkedProject) => {
        console.log("viewing project link!");
        // history.push(viewProjectLink(record));
      },
    },
    {
      key: "remove",
      label: "Remove Linked-project",
      icon: <FileOutlined />,
      clickFunction: (_event, record: ILinkedProject) => {
        console.log("remove linked project");
      },
    },
  ];

  const filterActions = (tableActions: ITableAction[]) => {
    return hasModifyPermission
      ? tableActions
      : tableActions.filter((a) => ["view"].includes(a.key));
  };

  const columns: ColumnsType<ILinkedProject> = [
    renderTextColumn("project_title", "Project Title", true),
    renderTextColumn("proponent_project_id", "Project #", true),
    renderTextColumn("status_code", "Status", true),
    renderTextColumn("primary_contact", "Contact", true),
    renderDateColumn("update_timestamp", "Last Updated", true),
    renderActionsColumn({ actions, recordActionsFilter: filterActions }),
  ];

  return (
    <CoreTable dataSource={getLinkedProjects(project)} columns={columns} condition={isLoaded} />
  );
};

export default ProjectLinksTable;
