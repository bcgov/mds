import React, { FC } from "react";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector, connect } from "react-redux";
// import { Field } from "redux-form";
// import ProjectLinksTable from "@mds/common/components/projects/ProjectLinksTable";
import { ILinkedProject, IProject } from "@mds/common/interfaces";
import FileOutlined from "@ant-design/icons/FileOutlined";
import {
  ITableAction,
  renderActionsColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { ColumnsType } from "antd/es/table";
import { Typography } from "antd";
import { useHistory } from "react-router-dom";
import { USER_ROLES, getStatusDescription } from "@mds/common/constants";
import { getSystemFlag, userHasRole } from "@mds/common/redux/reducers/authenticationReducer";
// import { renderConfig } from "@mds/common/components/forms/config";

interface ProjectLinksProps {
  viewProjectLink: (record) => string;
}

// interface ReduxProps {
//   project: any;
//   systemFlag: any;
//   // getProject: any;
//   // getSystemFlag: any;
//   // user
// }

const ProjectLinks: FC<ProjectLinksProps> = ({ viewProjectLink }) => {
  console.log(React);

  console.log("getProject", getProject);
  console.log("getSystemFlag", getSystemFlag);
  console.log("userHasRole", userHasRole);
  console.log("useSelector", useSelector);
  // console.log(project, systemFlag);

  const history = useHistory();
  const project = useSelector(getProject);
  // const systemFlag = useSelector(getSystemFlag);
  // const isProponent = useSelector((state) => userHasRole(state, USER_ROLES.role_minespace_proponent));
  // const canEditCore = useSelector((state) => userHasRole(state, USER_ROLES.role_edit_project_summaries));
  // const hasModifyPermission = isProponent || canEditCore;

  // console.log(isProponent, canEditCore);

  // console.log(systemFlag);

  const hasModifyPermission = true;

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
        history.push(viewProjectLink(record));
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
    <>
      <Typography.Title level={3}>Related Projects</Typography.Title>
      <Typography.Paragraph>
        Link related projects to help with communication with your team and the ministry.
      </Typography.Paragraph>
      {/* <Field 
        name={'linked-projects'}
        component={renderConfig}
        label="Select one or more related projects (optional)"
      /> */}
      {/* <ProjectLinksTable linkedProjects={getLinkedProjects(project)} tableColumns={columns} /> */}
    </>
  );
};

// const mapStateToProps = (state) => ({
//   project: getProject(state),
//   systemFlag: getSystemFlag(state),
// });

// export default connect(mapStateToProps, null)(ProjectLinks);
export default ProjectLinks;
