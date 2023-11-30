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

const ProjectLinks = () => {
  const project = useSelector(getProject);

  const getLinkedProjects = (data: IProject): ILinkedProject[] => {
    return data.project_links.flatMap((link) => {
      const isSameProject = link.project.project_guid === data.project_guid;
      const isSameRelatedProject = link.related_project.project_guid === data.project_guid;

      const transformProject = (res) => ({
        key: res.project_guid,
        project_title: res.project_title,
        proponent_project_id: project.proponent_project_id,
        status_code: project.project_summary.status_code,
        mine_guid: project.mine_guid,
        primary_contact: project.contacts.find((c: any) => c.name)?.name || "",
        update_timestamp: project.update_timestamp,
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
      label: "View",
      icon: <FileOutlined />,
      clickFunction: (_event, record: IProject) => console.log("view", record),
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
      {
        <ProjectLinksTable
          linkedProjects={getLinkedProjects(project)}
          tableColumns={getColumns()}
        />
      }
    </>
  );
};
export default ProjectLinks;
