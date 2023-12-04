import React from "react";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector } from "react-redux";
import ProjectLinksTable from "@mds/common/components/projects/ProjectLinksTable";
import { ILinkedProject, IProject } from "@mds/common/interfaces";
import FileOutlined from "@ant-design/icons/FileOutlined";
import {
  renderActionsColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { ColumnsType } from "antd/es/table";
import { Typography } from "antd";
import { useHistory } from "react-router-dom";
import { EDIT_PROJECT } from "@/constants/routes";
import { getStatusDescription } from "@mds/common/constants";

const ProjectLinks = () => {
  const history = useHistory();
  const project = useSelector(getProject);

  const getLinkedProjects = (data: IProject): ILinkedProject[] => {
    return data.project_links.flatMap((link) => {
      const isSameProject = link.project.project_guid === data.project_guid;
      const isSameRelatedProject = link.related_project.project_guid === data.project_guid;

      const transformProject = (res) => ({
        fullStuff: JSON.stringify(res),
        project_guid: res.project_guid,
        project_summary_guid: res.project_summary.project_summary_guid,
        project_title: res.project_title,
        proponent_project_id: res.proponent_project_id,
        status_code: getStatusDescription(
          res.project_summary.status_code,
          res.major_mine_application.status_code,
          res.information_requirements_table.status_code
        ),
        mine_guid: res.mine_guid,
        primary_contact: res.contacts.find((c: any) => c.name)?.name || "",
        update_timestamp: res.update_timestamp,
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
        history.push(EDIT_PROJECT.dynamicRoute(record.project_guid));
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

  const getColumns = (): ColumnsType<ILinkedProject> => {
    const columns = [
      renderTextColumn("project_title", "Project Title", true),
      renderTextColumn("proponent_project_id", "Project #", true),
      renderTextColumn("status_code", "Status", true),
      renderTextColumn("primary_contact", "Contact", true),
      renderDateColumn("update_timestamp", "Last Updated", true),
      renderActionsColumn(actions),
    ];
    return columns;
  };

  return (
    <>
      <Typography.Title level={3}>Related Projects</Typography.Title>
      <Typography.Paragraph>
        Link related projects to help with communication with your team and the ministry.
      </Typography.Paragraph>
      <ProjectLinksTable linkedProjects={getLinkedProjects(project)} tableColumns={getColumns()} />
    </>
  );
};
export default ProjectLinks;
