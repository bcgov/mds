import React, { FC, useEffect, useState } from "react";
import { withRouter, Link, Prompt, useParams, useHistory, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { submit, getFormValues, getFormSyncErrors, reset, touch } from "redux-form";
import * as routes from "@/constants/routes";
import { Tabs, Tag } from "antd";
import EnvironmentOutlined from "@ant-design/icons/EnvironmentOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";

import NullScreen from "@/components/common/NullScreen";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import {
  getFormattedProjectSummary,
  getProject,
} from "@mds/common/redux/selectors/projectSelectors";
import { FORM, Feature } from "@mds/common";
import { getMineDocuments } from "@mds/common/redux/reducers/mineReducer";
import { getProjectSummaryAuthorizationTypesArray } from "@mds/common/redux/selectors/staticContentSelectors";
import withFeatureFlag from "@mds/common/providers/featureFlags/withFeatureFlag";
import {
  createProjectSummary,
  fetchProjectById,
  fetchProjectSummaryById,
  removeDocumentFromProjectSummary,
  updateProject,
  updateProjectSummary,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import {
  fetchMineDocuments,
  fetchMineRecordById,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { flattenObject } from "@mds/common/redux/utils/helpers";
import { clearProjectSummary } from "@mds/common/redux/actions/projectActions";
import Loading from "@/components/common/Loading";
import ScrollSideMenu from "@mds/common/components/common/ScrollSideMenu";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";

export const ProjectSummary: FC = () => {
  const dispatch = useDispatch();

  const history = useHistory();
  const { pathname } = useLocation();
  const { mineGuid, projectSummaryGuid, projectGuid, tab } = useParams<{
    mineGuid: string;
    projectSummaryGuid: string;
    projectGuid: string;
    tab: string;
  }>();

  const formattedProjectSummary = useSelector(getFormattedProjectSummary);
  const project = useSelector(getProject);
  const mines = useSelector(getMines);
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const formErrors = useSelector(getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const anyTouched = useSelector(
    (state) => state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.anyTouched || false
  );
  const mineDocuments = useSelector(getMineDocuments);
  const projectSummaryAuthorizationTypesArray = useSelector(
    getProjectSummaryAuthorizationTypesArray
  );

  const { isFeatureEnabled } = useFeatureFlag();

  const [isValid, setIsValid] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);
  const [fixedTop, setFixedTop] = useState(false);
  const [activeTab, setActiveTab] = useState("project-descriptions");
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [mineName, setMineName] = useState(formattedProjectSummary.mine_name);

  const [projectMineGuid, setProjectMineGuid] = useState(
    formattedProjectSummary.mine_guid ?? mineGuid
  );

  const handleScroll = () => {
    if (window.pageYOffset > 170 && !fixedTop) {
      setFixedTop(true);
    } else if (window.pageYOffset <= 170 && fixedTop) {
      setFixedTop(false);
    }
  };

  const handleFetchData = () => {
    setIsLoaded(false);
    if (projectGuid && projectSummaryGuid) {
      return dispatch(fetchProjectById(projectGuid))
        .then((res) => {
          setIsLoaded(true);
          setProjectMineGuid(res.mine_guid);
          setIsValid(true);
          setIsNewProject(false);
          setUploadedDocuments(res.project_summary.documents);
          dispatch(
            // @ts-ignore (argument mismatch, needs to be made optional)
            fetchMineDocuments(res.mine_guid, {
              project_summary_guid: projectSummaryGuid,
              is_archived: true,
            })
          );
        })
        .catch((err) => {
          console.error(err);
          setIsLoaded(false);
          setIsValid(false);
        });
    }
    return dispatch(fetchMineRecordById(projectMineGuid)).then(() => {
      const mine = mines[projectMineGuid];
      setIsNewProject(true);
      setIsLoaded(true);
      setActiveTab(tab);
      setMineName(mine.mine_name);
    });
  };

  const removeUploadedDocument = (payload, docs) => {
    if (Array.isArray(payload.documents)) {
      const uploadedGUIDs = new Set(docs.map((doc) => doc.document_manager_guid));
      payload.documents = payload.documents.filter(
        (doc) => !uploadedGUIDs.has(doc.document_manager_guid)
      );
    }
    return payload;
  };

  const handleTransformPayload = (payload) => {
    const values = removeUploadedDocument(payload, uploadedDocuments);
    let payloadValues: any = {};
    const updatedAuthorizations = [];

    Object.keys(values).forEach((key) => {
      // Pull out form properties from request object that match known authorization types
      if (values[key] && projectSummaryAuthorizationTypesArray?.includes(key)) {
        const project_summary_guid = values?.project_summary_guid;
        const authorization = values?.authorizations?.find(
          (auth) => auth?.project_summary_authorization_type === key
        );
        updatedAuthorizations.push({
          ...values[key],
          // Conditionally add project_summary_guid and project_summary_authorization_guid properties if this a pre-existing authorization
          // ... otherwise treat it as a new one which won't have those two properties yet.
          ...(project_summary_guid && { project_summary_guid }),
          ...(authorization && {
            project_summary_authorization_guid: authorization?.project_summary_authorization_guid,
          }),
          project_summary_authorization_type: key,
          project_summary_permit_type:
            key === "OTHER" ? ["OTHER"] : values[key]?.project_summary_permit_type,
          existing_permits_authorizations:
            values[key]?.existing_permits_authorizations?.split(",") || [],
        });
        delete values[key];
      }
    });

    payloadValues = {
      ...values,
      authorizations: updatedAuthorizations,
    };
    delete payloadValues.authorizationOptions;
    return payloadValues;
  };

  const handleUpdate = (message) => {
    const { project_guid, mrc_review_required, contacts, project_lead_party_guid } = formValues;
    return dispatch(
      updateProjectSummary(
        { projectGuid: project_guid, projectSummaryGuid },
        handleTransformPayload({ ...formValues }),
        message
      )
    )
      .then(() => {
        dispatch(
          updateProject(
            { projectGuid: project_guid },
            { mrc_review_required, contacts, project_lead_party_guid },
            "Successfully updated project.",
            false
          )
        );
      })
      .then(() => {
        handleFetchData();
      });
  };

  const handleCreate = (message) => {
    dispatch(
      createProjectSummary(
        { mineGuid: projectMineGuid },
        handleTransformPayload({ status_code: "SUB", ...formValues }),
        message
      )
    )
      .then(({ data: { project_guid, project_summary_guid } }) => {
        history.push(routes.PRE_APPLICATIONS.dynamicRoute(project_guid, project_summary_guid));
      })
      .then(() => handleFetchData());
  };

  const reloadData = async (mine_guid, project_summary_guid) => {
    setIsLoaded(false);
    try {
      await dispatch(fetchProjectSummaryById(mine_guid, project_summary_guid));
    } finally {
      setIsLoaded(true);
    }
  };

  const handleRemoveDocument = (event, documentGuid) => {
    event.preventDefault();
    const { project_summary_guid, project_guid, mine_guid } = formattedProjectSummary;
    return dispatch(
      removeDocumentFromProjectSummary(project_guid, project_summary_guid, documentGuid)
    )
      .then(() => {
        reloadData(mine_guid, project_summary_guid);
      })
      .finally(() => setIsLoaded(true));
  };

  const handleSaveData = (e, message) => {
    e.preventDefault();

    dispatch(submit(FORM.ADD_EDIT_PROJECT_SUMMARY));
    dispatch(touch(FORM.ADD_EDIT_PROJECT_SUMMARY));
    const errors = Object.keys(flattenObject(formErrors));
    if (errors.length === 0) {
      if (isNewProject) {
        return handleCreate(message);
      }
      return handleUpdate(message);
    }
    return null;
  };

  useEffect(() => {
    handleFetchData();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      dispatch(clearProjectSummary());
    };
  }, [projectSummaryGuid]);

  if (!isValid) {
    return <NullScreen type="generic" />;
  }
  if (!isLoaded) {
    return <Loading />;
  }

  const tabItems = [
    {
      key: "project-descriptions",
      label: "Project Descriptions",
      children: (
        <LoadingWrapper condition={isLoaded}>
          <div
            className={
              fixedTop ? "side-menu--content with-fixed-top top-125" : "side-menu--content"
            }
          >
            <ProjectSummaryForm
              onSubmit={() => {}}
              project={project}
              isNewProject={isNewProject}
              handleSaveData={handleSaveData}
              removeDocument={handleRemoveDocument}
              onArchivedDocuments={reloadData.bind(this, projectMineGuid, projectSummaryGuid)}
              archivedDocuments={mineDocuments}
              initialValues={
                !isNewProject
                  ? { ...formattedProjectSummary, mrc_review_required: project.mrc_review_required }
                  : {
                      contacts: [
                        {
                          is_primary: true,
                          name: null,
                          job_title: null,
                          company_name: null,
                          email: null,
                          phone_number: null,
                          phone_extension: null,
                        },
                      ],
                      documents: [],
                    }
              }
            />
          </div>
        </LoadingWrapper>
      ),
    },
  ];

  const menuOptions = [
    { href: "project-details", title: "Project details" },
    { href: "authorizations-involved", title: "Authorizations Involved" },
    { href: "project-dates", title: "Project dates" },
    { href: "project-contacts", title: "Project contacts" },
    { href: "document-details", title: "Documents" },
    isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE) && {
      href: "archived-documents",
      title: "Archived Documents",
    },
  ].filter(Boolean);

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
        <div
          className={fixedTop ? "padding-lg view--header fixed-scroll" : " padding-lg view--header"}
        >
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
                ? routes.PROJECTS.dynamicRoute(formattedProjectSummary.project_guid)
                : routes.MINE_PRE_APPLICATIONS.dynamicRoute(mineGuid)
            }
          >
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to: {mineName} Project overview
          </Link>
        </div>
        <div className={fixedTop ? "side-menu--fixed" : "side-menu top-100"}>
          <ScrollSideMenu
            menuOptions={menuOptions}
            featureUrlRoute={routes.PRE_APPLICATIONS.hashRoute}
            featureUrlRouteArguments={[mineGuid, projectSummaryGuid]}
          />
        </div>
        <Tabs
          size="large"
          activeKey={activeTab}
          animated={{ inkBar: true, tabPane: false }}
          className="now-tabs"
          style={{ margin: "0" }}
          centered
          items={tabItems}
        ></Tabs>
      </div>
    </>
  );
};

export default withRouter(withFeatureFlag(ProjectSummary));
