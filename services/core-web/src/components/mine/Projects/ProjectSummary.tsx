import React, { FC, useEffect, useState } from "react";
import { withRouter, Link, Prompt, useParams, useHistory, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "redux-form";
import * as routes from "@/constants/routes";
import { Button, Col, Row, Tag } from "antd";
import EnvironmentOutlined from "@ant-design/icons/EnvironmentOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";

import NullScreen from "@/components/common/NullScreen";
import {
  getFormattedProjectSummary,
  getProject,
} from "@mds/common/redux/selectors/projectSelectors";
import { FORM, Feature } from "@mds/common";
import { getMineById } from "@mds/common/redux/reducers/mineReducer";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";
import {
  createProjectSummary,
  fetchProjectById,
  updateProject,
  updateProjectSummary,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import Loading from "@/components/common/Loading";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectSummaryForm, {
  getProjectFormTabs,
} from "@mds/common/components/projectSummary/ProjectSummaryForm";
import { fetchRegions } from "@mds/common/redux/slices/regionsSlice";
import { clearProjectSummary } from "@mds/common/redux/actions/projectActions";

export const ProjectSummary: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { pathname } = useLocation();
  const { mineGuid, projectSummaryGuid, projectGuid, tab, mode } = useParams<{
    mineGuid: string;
    projectSummaryGuid: string;
    projectGuid: string;
    tab: string;
    mode: string;
  }>();

  const mine = useSelector((state) => getMineById(state, mineGuid));
  const formattedProjectSummary = useSelector(getFormattedProjectSummary);
  const project = useSelector(getProject);
  const anyTouched = useSelector(
    (state) => state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.anyTouched || false
  );

  const { isFeatureEnabled } = useFeatureFlag();
  const amsFeatureEnabled = isFeatureEnabled(Feature.AMS_AGENT);
  const projectFormTabs = getProjectFormTabs(amsFeatureEnabled, true);

  const isExistingProject = Boolean(projectGuid && projectSummaryGuid);
  const isDefaultLoaded = isExistingProject
    ? formattedProjectSummary?.project_summary_guid === projectSummaryGuid &&
      formattedProjectSummary?.project_guid === projectGuid
    : mine?.mine_guid === mineGuid;
  const isDefaultEditMode = !isExistingProject || mode === "edit";

  const [isLoaded, setIsLoaded] = useState(isDefaultLoaded);
  // isNewProject on CORE and isEditMode on MS are inverses of each other
  const [isNewProject, setIsNewProject] = useState(isDefaultEditMode);
  // this isEditMode doesn't mean new/edit, it's edit/view
  const [isEditMode, setIsEditMode] = useState(isDefaultEditMode);
  const activeTab = tab ?? projectFormTabs[0];
  const mineName = mine?.mine_name ?? formattedProjectSummary?.mine_name ?? "";

  const handleFetchData = () => {
    setIsLoaded(false);
    if (projectGuid && projectSummaryGuid) {
      setIsNewProject(false);
      dispatch(fetchRegions(undefined));
      dispatch(fetchProjectById(projectGuid));
    } else {
      dispatch(fetchMineRecordById(mineGuid));
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      handleFetchData();
    }
    return () => {
      dispatch(clearProjectSummary());
    };
  }, []);

  useEffect(() => {
    if ((formattedProjectSummary?.project_guid && !isNewProject) || mine?.mine_guid) {
      setIsLoaded(true);
    }
  }, [formattedProjectSummary, mine]);

  const removeUploadedDocument = (payload, docs) => {
    if (Array.isArray(payload.documents)) {
      const uploadedGUIDs = new Set(docs.map((doc) => doc.document_manager_guid));
      payload.documents = payload.documents.filter(
        (doc) => !uploadedGUIDs.has(doc.document_manager_guid)
      );
    }
    return payload;
  };

  const handleCreateProjectSummary = async (values, message) => {
    return dispatch(
      createProjectSummary(
        {
          mineGuid,
        },
        values,
        message
      )
    ).then(({ data: { project_guid, project_summary_guid } }) => {
      history.replace(
        routes.EDIT_PROJECT_SUMMARY.dynamicRoute(
          project_guid,
          project_summary_guid,
          projectFormTabs[1],
          false
        )
      );
    });
  };

  const handleUpdateProjectSummary = async (payload, message) => {
    setIsLoaded(false);
    return dispatch(
      updateProjectSummary(
        {
          projectGuid,
          projectSummaryGuid,
        },
        payload,
        message
      )
    )
      .then(async () => {
        await dispatch(
          updateProject(
            { projectGuid },
            { mrc_review_required: payload.mrc_review_required, contacts: payload.contacts },
            "Successfully updated project.",
            false
          )
        );
      })
      .then(async () => {
        handleFetchData();
      });
  };

  const handleTabChange = (newTab: string) => {
    if (!newTab) {
      return;
    }
    const url = !isNewProject
      ? routes.EDIT_PROJECT_SUMMARY.dynamicRoute(
          projectGuid,
          projectSummaryGuid,
          newTab,
          !isEditMode
        )
      : routes.ADD_PROJECT_SUMMARY.dynamicRoute(mineGuid, newTab);
    history.push(url);
  };

  const handleSaveData = async (formValues, newActiveTab?: string) => {
    console.log(formValues, newActiveTab);
    const message = newActiveTab
      ? "Successfully updated the project description."
      : "Successfully submitted a project description to the Province of British Columbia.";

    let status_code = formattedProjectSummary.status_code;
    if (!status_code || isNewProject) {
      status_code = "DFT";
    } else if (!newActiveTab) {
      status_code = "SUB";
    }
    const values = { ...formValues, status_code: status_code };

    try {
      if (isNewProject) {
        await handleCreateProjectSummary(values, message);
      }
      if (projectGuid && projectSummaryGuid) {
        await handleUpdateProjectSummary(values, message);
        handleTabChange(newActiveTab);
      }
    } catch (err) {
      console.log(err);
      setIsLoaded(true);
    }
  };

  if (!isLoaded) {
    return <Loading />;
  }

  const initialValues = isNewProject
    ? {}
    : { ...formattedProjectSummary, mrc_review_required: project.mrc_review_required };

  return (
    <>
      <Prompt
        when={anyTouched}
        message={(location, action) => {
          if (action === "REPLACE") {
            dispatch(reset(FORM.ADD_EDIT_PROJECT_SUMMARY));
          }
          return pathname !== location.pathname &&
            !location.pathname.includes("project-description") &&
            anyTouched
            ? "You have unsaved changes. Are you sure you want to leave without saving?"
            : true;
        }}
      />
      <div className="page">
        <Row
          className=" padding-lg view--header fixed-scroll"
          justify="space-between"
          align="middle"
        >
          <Col>
            <h1>
              {!isNewProject
                ? formattedProjectSummary.project_summary_title
                : "New Project Description"}
              <span className="padding-sm--left">
                <Tag title={`Mine: ${mineName}`}>
                  <Link
                    style={{ textDecoration: "none" }}
                    to={routes.MINE_GENERAL.dynamicRoute(mineGuid)}
                  >
                    <EnvironmentOutlined className="padding-sm--right" />
                    {mineName}
                  </Link>
                </Tag>
              </span>
            </h1>
            <Link
              data-cy="back-to-project-link"
              to={
                formattedProjectSummary.project_guid && !isNewProject
                  ? routes.EDIT_PROJECT.dynamicRoute(formattedProjectSummary.project_guid)
                  : routes.MINE_PRE_APPLICATIONS.dynamicRoute(mineGuid)
              }
            >
              <ArrowLeftOutlined className="padding-sm--right" />
              Back to: {mineName} Project overview
            </Link>
          </Col>
          <Col>
            <Button type="primary" onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? "Cancel" : "Edit Project Description"}
            </Button>
          </Col>
        </Row>
        <div className="top-125">
          <LoadingWrapper condition={isLoaded}>
            <ProjectSummaryForm
              initialValues={initialValues}
              isEditMode={isEditMode}
              handleSaveData={handleSaveData}
              handleTabChange={handleTabChange}
              activeTab={activeTab}
            />
          </LoadingWrapper>
        </div>
      </div>
    </>
  );
};

export default withRouter(withFeatureFlag(ProjectSummary));
