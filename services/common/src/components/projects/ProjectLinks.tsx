import React, { FC, useEffect, useState } from "react";
import { getProject, getProjects } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector, useDispatch } from "react-redux";
import { Field, change } from "redux-form";
import ProjectLinksTable from "@mds/common/components/projects/ProjectLinksTable";
import { ILinkedProject, IProject } from "@mds/common/interfaces";

import { Button, Col, Row, Typography } from "antd";
import { FORM, USER_ROLES, getProjectStatusDescription } from "@mds/common/constants";
import { isProponent, userHasRole } from "@mds/common/redux/reducers/authenticationReducer";
import {
  createProjectLinks,
  fetchProjectsByMine,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { dateSorter } from "@mds/common/redux/utils/helpers";
import RenderMultiSelect from "../forms/RenderMultiSelect";
import * as Strings from "@mds/common/constants/strings";

interface ProjectLinksProps {
  viewProject: (record: ILinkedProject) => string;
  tableOnly?: boolean; // only show the table, no inputs
}
// outside of component to sneak past "hooks can't be rendered conditionally"
const ProjectLinkInput = ({ unrelatedProjects = [], mineGuid, projectGuid }) => {
  const dispatch = useDispatch();
  const [currentSelection, setCurrentSelection] = useState([]);
  const formName = FORM.ADD_EDIT_PROJECT_SUMMARY;
  const fieldName = "linked-projects";

  if (!projectGuid) {
    return (
      <Typography.Paragraph>
        Please save this record first to add links to other project applications.
      </Typography.Paragraph>
    );
  }

  const transformUnrelatedProjects = (projects) => {
    const unrelated = projects.sort(dateSorter("update_timestamp", false)).map((p) => ({
      value: p.project_guid,
      label: `${p.project_title} ${new Date(p.update_timestamp).toDateString()}`,
    }));
    return unrelated;
  };

  const addRelatedProjects = () => {
    dispatch(createProjectLinks(mineGuid, projectGuid, currentSelection)).then(() => {
      dispatch(change(formName, fieldName, []));
    });
  };

  const handleChange = (args) => {
    const newValues = args[0];
    setCurrentSelection(newValues);
  };

  return (
    <Row align="bottom" justify="start">
      <Col>
        <Field
          id="linked-projects"
          name="linked-projects"
          props={{
            label: "Select one or more related projects",
            data: transformUnrelatedProjects(unrelatedProjects),
          }}
          component={RenderMultiSelect}
          onChange={(...args) => handleChange(args)}
        />
        <Button type="primary" onClick={addRelatedProjects} className="block-button">
          Add
        </Button>
      </Col>
    </Row>
  );
};

const ProjectLinks: FC<ProjectLinksProps> = ({ viewProject, tableOnly = false }) => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [unrelatedProjects, setUnrelatedProjects] = useState([]);
  const [projectLinks, setProjectLinks] = useState([]);
  const project = useSelector(getProject);
  const mineProjects = useSelector(getProjects);
  const isUserProponent = useSelector(isProponent);
  const canEditProjects = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_project_summaries)
  );
  const hasModifyPermission = isUserProponent || canEditProjects;

  const separateProjectLists = (projects: IProject[]): [ILinkedProject[], IProject[]] => {
    // guids to filter out from the input as options
    const relatedProjectGuids = [project.project_guid];
    const { project_links = [] } = project;
    const related: ILinkedProject[] = project_links.map((link) => {
      const relatedProject =
        link.project.project_guid === project.project_guid ? link.related_project : link.project;
      relatedProjectGuids.push(relatedProject.project_guid);
      const status_description = getProjectStatusDescription(
        relatedProject.project_summary.status_code,
        relatedProject.major_mine_application.status_code,
        relatedProject.information_requirements_table.status_code
      );
      const primary_contact = relatedProject.contacts.find((c: any) => c.is_primary);
      const name = [primary_contact?.first_name, primary_contact?.last_name].join(" ").trim();
      const { project_summary_guid } = relatedProject.project_summary;
      return {
        ...relatedProject,
        primary_contact: name || Strings.EMPTY_FIELD,
        status_description,
        project_summary_guid,
        project_link_guid: link.project_link_guid,
      };
    });

    const unrelated: IProject[] = projects.filter(
      (p) => !relatedProjectGuids.includes(p.project_guid) && p.project_guid !== project.guid
    );
    return [related, unrelated];
  };

  useEffect(() => {
    let isMounted = true;

    if (project?.mine_guid) {
      dispatch(fetchProjectsByMine({ mineGuid: project.mine_guid })).then(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });
    }
    return () => (isMounted = false);
  }, []);

  useEffect(() => {
    const [related, unrelated] = separateProjectLists(mineProjects);
    setUnrelatedProjects(unrelated);
    setProjectLinks(related);
  }, [mineProjects, project.project_links]);

  return (
    <>
      <Typography.Title level={3}>Related Project Applications</Typography.Title>
      <Typography.Paragraph>
        Description of related major project applications for this mine are listed below.
      </Typography.Paragraph>
      {!tableOnly && (
        <ProjectLinkInput
          unrelatedProjects={unrelatedProjects}
          mineGuid={project.mine_guid}
          projectGuid={project.project_guid}
        />
      )}
      {project.project_guid && (
        <ProjectLinksTable
          projectGuid={project.project_guid}
          projectLinks={projectLinks}
          hasModifyPermission={hasModifyPermission && !tableOnly}
          viewProject={viewProject}
          isLoaded={isLoaded}
        />
      )}
    </>
  );
};

export default ProjectLinks;
