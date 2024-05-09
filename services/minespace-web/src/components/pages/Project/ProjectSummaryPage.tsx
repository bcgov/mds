import React, { FC, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { flattenObject } from "@common/utils/helpers";
import { Link, Prompt, useHistory, useLocation, useParams } from "react-router-dom";
import {
  submit,
  formValueSelector,
  getFormSyncErrors,
  getFormValues,
  reset,
  touch,
  change,
} from "redux-form";
import { Row, Col, Typography, Divider } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
  getProject,
} from "@mds/common/redux/selectors/projectSelectors";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryAuthorizationTypesArray,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  createProjectSummary,
  updateProjectSummary,
  fetchProjectById,
  updateProject,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { clearProjectSummary } from "@mds/common/redux/actions/projectActions";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import {
  EDIT_PROJECT_SUMMARY,
  MINE_DASHBOARD,
  ADD_PROJECT_SUMMARY,
  EDIT_PROJECT,
} from "@/constants/routes";
import ProjectSummaryForm, {
  getProjectFormTabs,
} from "@/components/Forms/projects/projectSummary/ProjectSummaryForm";
import { IMine, IProjectSummary, IProject, Feature, removeNullValuesRecursive } from "@mds/common";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { isArray } from "lodash";

interface ProjectSummaryPageProps {
  mines: Partial<IMine>[];
  projectSummary: Partial<IProjectSummary>;
  project: Partial<IProject>;
  fetchProjectById: ActionCreator<typeof fetchProjectById>;
  createProjectSummary: ActionCreator<typeof createProjectSummary>;
  updateProjectSummary: ActionCreator<typeof updateProjectSummary>;
  fetchMineRecordById: ActionCreator<typeof fetchMineRecordById>;
  updateProject: ActionCreator<typeof updateProject>;
  clearProjectSummary: () => any;
  projectSummaryDocumentTypesHash: Record<string, string>;
  submit: (arg1?: string) => any;
  formValueSelector: (arg1: string, arg2?: any) => any;
  getFormSyncErrors: (arg1: string) => any;
  reset: (arg1: string) => any;
  touch: (arg1?: string, arg2?: any) => any;
  formErrors: Record<string, string>;
  formValues: any;
  projectSummaryAuthorizationTypesArray: any[];
  anyTouched: boolean;
  formattedProjectSummary: any;
  location: Record<any, string>;
  change: any;
}

interface IParams {
  mineGuid?: string;
  projectGuid?: string;
  projectSummaryGuid?: string;
  tab?: any;
}

export const ProjectSummaryPage: FC<ProjectSummaryPageProps> = (props) => {
  const {
    mines,
    formattedProjectSummary,
    project,
    projectSummary,
    projectSummaryAuthorizationTypesArray,
    projectSummaryDocumentTypesHash,
    formValues,
    formErrors,
    submit,
    touch,
    anyTouched,
    reset,
    fetchProjectById,
    fetchMineRecordById,
    clearProjectSummary,
    createProjectSummary,
    updateProjectSummary,
    updateProject,
    change,
  } = props;

  const { isFeatureEnabled } = useFeatureFlag();
  const amsFeatureEnabled = isFeatureEnabled(Feature.AMS_AGENT);
  const { mineGuid, projectGuid, projectSummaryGuid, tab } = useParams<IParams>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const projectFormTabs = getProjectFormTabs(amsFeatureEnabled);
  const activeTab = tab ?? projectFormTabs[0];
  const dispatch = useDispatch();

  const handleFetchData = () => {
    if (projectGuid && projectSummaryGuid) {
      setIsEditMode(true);
      return fetchProjectById(projectGuid);
    }
    return fetchMineRecordById(mineGuid);
  };

  useEffect(() => {
    if (!isLoaded) {
      handleFetchData().then(() => setIsLoaded(true));
    }
    return () => {
      clearProjectSummary();
    };
  }, []);

  const transformAuthorizations = (valuesFromForm: any) => {
    const { authorizations = {}, project_summary_guid } = valuesFromForm;

    const transformAuthorization = (type, authorization) => {
      return { ...authorization, project_summary_authorization_type: type, project_summary_guid };
    };

    let updatedAuthorizations = [];
    let newAmsAuthorizations = [];
    let amendAmsAuthorizations = [];

    projectSummaryAuthorizationTypesArray.forEach((type) => {
      const authsOfType = authorizations[type];
      if (authsOfType) {
        if (isArray(authsOfType)) {
          const formattedAuthorizations = authsOfType.map((a) => {
            return transformAuthorization(type, a);
          });
          updatedAuthorizations = updatedAuthorizations.concat(formattedAuthorizations);
        } else {
          newAmsAuthorizations = newAmsAuthorizations.concat(
            authsOfType?.NEW.map((a) =>
              transformAuthorization(type, { ...a, project_summary_permit_type: ["NEW"] })
            )
          );
          amendAmsAuthorizations = amendAmsAuthorizations.concat(
            authsOfType?.AMENDMENT.map((a) =>
              transformAuthorization(type, { ...a, project_summary_permit_type: ["AMENDMENT"] })
            )
          );
        }
      }
    });
    return {
      authorizations: updatedAuthorizations,
      ams_authorizations: { amendments: amendAmsAuthorizations, new: newAmsAuthorizations },
    };
  };

  const handleTransformPayload = (valuesFromForm: any) => {
    let payloadValues: any = {};
    const updatedAuthorizations = transformAuthorizations(valuesFromForm);
    const values = removeNullValuesRecursive(valuesFromForm);
    payloadValues = {
      ...values,
      ...updatedAuthorizations,
    };
    // eslint-disable-next-line no-param-reassign
    delete payloadValues.authorizationTypes;
    return payloadValues;
  };

  const handleUpdateProjectSummary = async (values, message) => {
    const payload = handleTransformPayload(values);
    setIsLoaded(false);
    return updateProjectSummary(
      {
        projectGuid,
        projectSummaryGuid,
      },
      payload,
      message
    )
      .then(async () => {
        await updateProject(
          { projectGuid },
          { mrc_review_required: payload.mrc_review_required, contacts: payload.contacts },
          "Successfully updated project.",
          false
        );
      })
      .then(async () => {
        return handleFetchData();
      })
      .then(() => {
        setIsLoaded(true);
      });
  };

  const handleCreateProjectSummary = async (values, message) => {
    return createProjectSummary(
      {
        mineGuid: mineGuid,
      },
      handleTransformPayload(values),
      message
    ).then(({ data: { project_guid, project_summary_guid } }) => {
      history.replace(
        EDIT_PROJECT_SUMMARY.dynamicRoute(project_guid, project_summary_guid, projectFormTabs[1])
      );
    });
  };

  const handleTabChange = (newTab) => {
    const url = isEditMode
      ? EDIT_PROJECT_SUMMARY.dynamicRoute(projectGuid, projectSummaryGuid, newTab)
      : ADD_PROJECT_SUMMARY.dynamicRoute(mineGuid, newTab);
    history.push(url);
  };

  const handleSaveData = async (e, newActiveTab) => {
    if (e) {
      e.preventDefault();
    }

    const message = newActiveTab
      ? "Successfully updated the project description."
      : "Successfully submitted a project description to the Province of British Columbia.";

    let status_code = projectSummary.status_code;
    if (!status_code || !isEditMode) {
      status_code = "DFT";
    } else if (!newActiveTab) {
      status_code = "SUB";
    }

    const errors = Object.keys(flattenObject(formErrors));
    const values = { ...formValues, status_code: status_code };
    submit(FORM.ADD_EDIT_PROJECT_SUMMARY);
    touch(FORM.ADD_EDIT_PROJECT_SUMMARY);
    if (errors.length === 0) {
      try {
        if (!isEditMode) {
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
    }
  };

  const handleSaveDraft = async () => {
    const currentTabIndex = projectFormTabs.indexOf(activeTab);
    const newActiveTab = projectFormTabs[currentTabIndex + 1];
    const message = "Successfully saved a draft project description.";
    const values = { ...formValues, status_code: "DFT" };

    if (values.authorizations !== undefined && values.authorizations !== null) {
      for (const code of Object.keys(values.authorizations)) {
        if (values.authorizations?.[code] !== undefined) {
          const file_to_upload =
            values.authorizations?.[code]?.AMENDMENT[0]?.amendment_documents ?? [];
          const filtered = file_to_upload.filter((doc) => !doc.mine_document_guid);
          values.authorizations[code].AMENDMENT[0].amendment_documents = filtered;
          dispatch(
            change(
              FORM.ADD_EDIT_PROJECT_SUMMARY,
              values.authorizations[code].AMENDMENT[0].amendment_documents,
              filtered
            )
          );
        }
      }
    }

    submit(FORM.ADD_EDIT_PROJECT_SUMMARY);
    touch(FORM.ADD_EDIT_PROJECT_SUMMARY);
    const errors = Object.keys(flattenObject(formErrors));
    if (errors.length === 0) {
      try {
        if (!isEditMode) {
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
    }
  };

  const mineName = isEditMode
    ? formattedProjectSummary?.mine_name || ""
    : mines[mineGuid]?.mine_name || "";
  const title = isEditMode
    ? `Edit project description - ${projectSummary?.project_summary_title}`
    : `New project description for ${mineName}`;

  const initialValues = isEditMode
    ? { ...formattedProjectSummary, mrc_review_required: project.mrc_review_required }
    : {};

  return (
    (isLoaded && (
      <>
        <Prompt
          when={anyTouched}
          message={(newLocation, action) => {
            if (action === "REPLACE") {
              reset(FORM.ADD_EDIT_PROJECT_SUMMARY);
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
          mineGuid={mineGuid}
          isEditMode={isEditMode}
          handleSaveData={handleSaveData}
          handleSaveDraft={handleSaveDraft}
          projectSummaryDocumentTypesHash={projectSummaryDocumentTypesHash}
          handleTabChange={handleTabChange}
          activeTab={activeTab}
        />
      </>
    )) || <Loading />
  );
};

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  anyTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.anyTouched || false,
  fieldsTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.fields || {},
  mines: getMines(state),
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
  project: getProject(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
  formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
  contacts: selector(state, "contacts"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProjectSummary,
      updateProjectSummary,
      fetchMineRecordById,
      clearProjectSummary,
      fetchProjectById,
      updateProject,
      submit,
      reset,
      touch,
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryPage);
