import React, { FC, useEffect, useState } from "react";
import { getProject, getProjects } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector, useDispatch } from "react-redux";
import { Field } from "redux-form";
import ProjectLinksTable from "@mds/common/components/projects/ProjectLinksTable";
import { ILinkedProject, IProject } from "@mds/common/interfaces";

import { Button, Col, Row, Typography } from "antd";
import { USER_ROLES } from "@mds/common/constants";
import {
  getSystemFlag,
  isProponent,
  userHasRole,
} from "@mds/common/redux/reducers/authenticationReducer";
import { renderConfig } from "@mds/common/components/forms/config";
import {
  createProjectLinks,
  fetchProjectsByMine,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { dateSorter } from "@mds/common/redux/utils/helpers";

interface ProjectLinksProps {
  viewProjectLink: (record) => string;
  tableOnly?: boolean;
}

// outside of component to sneak past "hooks can't be rendered conditionally"
const ProjectLinkInput = ({ unrelatedProjects, mineGuid, projectGuid }) => {
  const dispatch = useDispatch();
  const [currentSelection, setCurrentSelection] = useState([]);

  const addRelatedProjects = () => {
    console.log("add is clicked!", currentSelection);
    dispatch(createProjectLinks(mineGuid, projectGuid, currentSelection)).then((resp) => {
      console.log(resp);
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
          component={renderConfig.MULTI_SELECT}
          label="Select one or more related projects (optional)"
          data={unrelatedProjects}
          // this produces a TS error "no overload matches this call". But it is in fact fine.
          onChange={(...args) => handleChange(args)}
        />
      </Col>
      <Col>
        <Button type="primary" onClick={addRelatedProjects}>
          Add
        </Button>
      </Col>
    </Row>
  );
};

const ProjectLinks: FC<ProjectLinksProps> = ({ viewProjectLink, tableOnly = false, ...props }) => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [unrelatedProjects, setUnrelatedProjects] = useState([]);
  const project = useSelector(getProject);
  const mineProjects = useSelector(getProjects);
  const systemFlag = useSelector(getSystemFlag);
  const isUserProponent = useSelector(isProponent);
  const canEditProjects = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_project_summaries)
  );
  const hasModifyPermission = isUserProponent || canEditProjects;
  console.log(project);

  const transformUnrelatedProjects = (projects) => {
    const unrelated = projects
      .filter((p) => p.project_guid !== project.project_guid)
      .sort(dateSorter("update_timestamp", false))
      .map((p) => ({
        value: p.project_guid,
        label: `${p.project_title} ${new Date(p.update_timestamp).toDateString()}`,
      }));
    console.log(unrelated);
    return unrelated;
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
  }, [project]);

  useEffect(() => {
    setUnrelatedProjects(transformUnrelatedProjects(mineProjects));
  }, [mineProjects]);

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
      <ProjectLinksTable
        project={project}
        hasModifyPermission={hasModifyPermission}
        isLoaded={isLoaded}
      />
    </>
  );
};

export default ProjectLinks;
