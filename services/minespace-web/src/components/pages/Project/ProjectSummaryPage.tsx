import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Prompt, useHistory, useLocation, useParams } from "react-router-dom";
import { reset } from "redux-form";
import { Col, Divider, Row, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import {
  getFormattedProjectSummary,
  getProject,
  getProjectSummary,
} from "@mds/common/redux/selectors/projectSelectors";
import {
  createProjectSummary,
  fetchProjectById,
  updateProject,
  updateProjectSummary,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { clearProjectSummary } from "@mds/common/redux/actions/projectActions";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import {
  ADD_PROJECT_SUMMARY,
  EDIT_PROJECT,
  EDIT_PROJECT_SUMMARY,
  MINE_DASHBOARD,
} from "@/constants/routes";
import ProjectSummaryForm, {
  getProjectFormTabs,
} from "@mds/common/components/projectSummary/ProjectSummaryForm";
import { Feature } from "@mds/common";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { fetchRegions } from "@mds/common/redux/slices/regionsSlice";

interface IParams {
  mineGuid?: string;
  projectGuid?: string;
  projectSummaryGuid?: string;
  tab?: string;
}

export const ProjectSummaryPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const { mineGuid, projectGuid, projectSummaryGuid, tab } = useParams<IParams>();
  const anyTouched = useSelector(
    (state) => state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.anyTouched || false
  );

  const mine = useSelector((state) => getMineById(state, mineGuid));
  const projectSummary = useSelector(getProjectSummary);
  const formattedProjectSummary = useSelector(getFormattedProjectSummary);
  const project = useSelector(getProject);

  const { isFeatureEnabled } = useFeatureFlag();
  const amsFeatureEnabled = isFeatureEnabled(Feature.AMS_AGENT);
  const isDefaultEditMode = Boolean(projectGuid && projectSummaryGuid);
  const isDefaultLoaded = isDefaultEditMode
    ? formattedProjectSummary?.project_summary_guid === projectSummaryGuid &&
      formattedProjectSummary?.project_guid === projectGuid
    : mine?.mine_guid === mineGuid;
  const [isLoaded, setIsLoaded] = useState(isDefaultLoaded);
  const [isEditMode, setIsEditMode] = useState(isDefaultEditMode);
  const projectFormTabs = getProjectFormTabs(amsFeatureEnabled);
  const activeTab = tab ?? projectFormTabs[0];

  const handleFetchData = async () => {
    if (projectGuid && projectSummaryGuid) {
      setIsEditMode(true);
      await dispatch(fetchRegions(undefined));
      await dispatch(fetchProjectById(projectGuid));
    } else {
      await dispatch(fetchMineRecordById(mineGuid));
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      handleFetchData().then(() => setIsLoaded(true));
    }
    return () => {
      dispatch(clearProjectSummary());
    };
  }, []);

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
            {
              mrc_review_required: payload.mrc_review_required,
              contacts: payload.contacts,
            },
            "Successfully updated project.",
            false
          )
        );
      })
      .then(async () => {
        await handleFetchData();
      });
  };

  const handleCreateProjectSummary = async (values, message) => {
    return dispatch(
      createProjectSummary(
        {
          mineGuid: mineGuid,
        },
        values,
        message
      )
    ).then(({ data: { project_guid, project_summary_guid } }) => {
      history.replace(
        EDIT_PROJECT_SUMMARY.dynamicRoute(project_guid, project_summary_guid, projectFormTabs[1])
      );
    });
  };

  const handleTabChange = async (newTab) => {
    if (!newTab) {
      return;
    }
    const url = isEditMode
      ? EDIT_PROJECT_SUMMARY.dynamicRoute(projectGuid, projectSummaryGuid, newTab)
      : ADD_PROJECT_SUMMARY.dynamicRoute(mineGuid, newTab);
    history.push(url);
  };

  const handleSaveData = async (formValues, newActiveTab?: string) => {
    const message = newActiveTab
      ? "Successfully updated the project description."
      : "Successfully submitted a project description to the Province of British Columbia.";

    let status_code = projectSummary.status_code;
    if (!status_code || !isEditMode) {
      status_code = "DFT";
    } else if (!newActiveTab) {
      status_code = "SUB";
    }

    const values = { ...formValues, status_code: status_code };

    try {
      if (!isEditMode) {
        await handleCreateProjectSummary(values, message);
      }
      if (projectGuid && projectSummaryGuid) {
        await handleUpdateProjectSummary(values, message);
        handleTabChange(newActiveTab);
        setIsLoaded(true);
      }
    } catch (err) {
      console.log(err);
      setIsLoaded(true);
    }
  };

  const mineName = isEditMode ? formattedProjectSummary?.mine_name || "" : mine?.mine_name || "";
  const title = isEditMode
    ? `Edit project description - ${projectSummary?.project_summary_title}`
    : `New project description for ${mineName}`;

  const initialValues = isEditMode
    ? {
        ...formattedProjectSummary,
        mrc_review_required: project.mrc_review_required,
      }
    : {};

  return (
    (isLoaded && (
      <>
        <Prompt
          when={anyTouched}
          message={(newLocation, action) => {
            if (action === "REPLACE") {
              dispatch(reset(FORM.ADD_EDIT_PROJECT_SUMMARY));
            }
            return location.pathname !== newLocation.pathname &&
              !newLocation.pathname.includes("project-description") &&
              anyTouched
              ? "You have unsaved changes. Are you sure you want to leave without saving?"
              : true;
          }}
        />
        <Row>
          <Col span={24}>
            <Typography.Title>{title}</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {isEditMode ? (
              <Link to={EDIT_PROJECT.dynamicRoute(projectSummary.project_guid)}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to: {project.project_title} Project Overview page
              </Link>
            ) : (
              <Link to={MINE_DASHBOARD.dynamicRoute(mineGuid, "applications")}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to: {mineName} Applications page
              </Link>
            )}
          </Col>
        </Row>
        <Divider />
        <ProjectSummaryForm
          initialValues={initialValues}
          handleSaveData={handleSaveData}
          handleTabChange={handleTabChange}
          activeTab={activeTab}
        />
      </>
    )) || <Loading />
  );
};

export default ProjectSummaryPage;
