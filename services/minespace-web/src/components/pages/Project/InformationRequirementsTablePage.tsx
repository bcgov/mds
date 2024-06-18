import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation, useParams, withRouter } from "react-router-dom";
import { Col, Row, Steps, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import { cleanFilePondFile } from "@common/utils/helpers";
import { getProject, getRequirements } from "@mds/common/redux/selectors/projectSelectors";
import { clearInformationRequirementsTable } from "@mds/common/redux/actions/projectActions";
import {
  fetchProjectById,
  fetchRequirements,
  updateInformationRequirementsTable,
  updateInformationRequirementsTableStatus,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { openModal } from "@mds/common/redux/actions/modalActions";
import { getInformationRequirementsTableDocumentTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { modalConfig } from "@/components/modalContent/config";
import * as routes from "@/constants/routes";
import InformationRequirementsTableCallout from "@/components/Forms/projects/informationRequirementsTable/InformationRequirementsTableCallout";
import StepForms from "@/components/pages/Project/InformationRequirementsTableStepForm";
import { IProject, IRequirement } from "@mds/common";

export const InformationRequirementsTablePage = () => {
  const requirements: IRequirement[] = useSelector(getRequirements);
  const project: IProject = useSelector(getProject);
  const informationRequirementsTableDocumentTypesHash = useSelector(
    getInformationRequirementsTableDocumentTypesHash
  );

  const { projectGuid, irtGuid } = useParams<{ projectGuid: string; irtGuid: string }>();
  const location = useLocation<{ current: number }>();
  const history = useHistory();

  const dispatch = useDispatch();

  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState();
  const [uploadedSuccessfully, setUploadedSuccessfully] = useState(false);
  const [importFailed, setImportFailed] = useState(false);
  const [importErrors, setImportErrors] = useState(null);
  const [hasBadRequestError, setHasBadRequestError] = useState(false);
  const [tabs, setTabs] = useState<string[]>([]);
  const [projectRequirementsVersion, setProjectRequirementsVersion] = useState<number>();

  const handleFetchData = async () => {
    await dispatch(fetchProjectById(projectGuid));
    await dispatch(fetchRequirements());
    setIsLoaded(true);
    setUploadedSuccessfully(false);
    setImportFailed(false);
    setImportErrors(null);
    setHasBadRequestError(false);
  };

  const openIRTImportErrorModal = (errors = []) => {
    const title = hasBadRequestError ? (
      <>
        <CloseCircleOutlined style={{ color: "red" }} />
        {"  "}Import Failed
      </>
    ) : (
      <>
        <CloseCircleOutlined style={{ color: "red" }} />
        {"  "}Error
      </>
    );

    return dispatch(
      openModal({
        props: {
          title,
          errors,
          isBadRequestError: hasBadRequestError,
        },
        content: modalConfig.IMPORT_IRT_FAILURE,
      })
    );
  };

  const openIRTImportSuccessModal = () => {
    const { project_guid: projectGuid } = project;
    const irtGuid = project?.information_requirements_table?.irt_guid;

    return dispatch(
      openModal({
        props: {
          title: (
            <>
              <CheckCircleOutlined style={{ color: "green" }} />
              {"  "}Import Successful
            </>
          ),
          navigateForward: () =>
            history.push({
              pathname: `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                projectGuid,
                irtGuid
              )}`,
              state: { current: 2 },
            }),
        },
        content: modalConfig.IMPORT_IRT_SUCCESS,
      })
    );
  };

  useEffect(() => {
    if (!location.state?.current) {
      history.replace(location.pathname, { current: 0 });
    }
    handleFetchData();
  }, []);

  useEffect(() => {
    if (project) {
      setCurrent(location.state?.current ?? 0);
      if (project?.information_requirements_table?.status_code !== "DFT") {
        setEditMode(true);
      }
    }
  }, [project]);

  useEffect(() => {
    if (importFailed && importErrors) {
      openIRTImportErrorModal(importErrors);
    }
  }, [importFailed, importErrors]);

  useEffect(() => {
    if (uploadedSuccessfully) {
      openIRTImportSuccessModal();
    }
  }, [uploadedSuccessfully]);

  useEffect(() => {
    return () => {
      dispatch(clearInformationRequirementsTable({}));
    };
  }, []);

  const getRequirementsVersion = () => {
    return (
      project.information_requirements_table.requirements?.[0]?.version ??
      requirements[requirements.length - 1].version
    );
  };

  useEffect(() => {
    if (requirements.length > 0 && project.information_requirements_table) {
      const projectRequirementsVersion = getRequirementsVersion();

      setProjectRequirementsVersion(projectRequirementsVersion);

      const topLevelRequirements: IRequirement[] = requirements.filter(
        (requirement: IRequirement) =>
          requirement.parent_requirement_id === null &&
          requirement.version === projectRequirementsVersion
      );

      setTabs(topLevelRequirements.map((requirement) => requirement.description));
    }
  }, [requirements, project]);

  const marshalImportIRTError = (error) => {
    // Transform single quotes on object properties to double to allow JSON parse
    const formattedError = error.replaceAll(`'`, `"`);
    const regex = /({"row_number": \d+, "section": \d+, "error": "\w+"})/g;
    const errorMatch = formattedError.match(regex);
    if (!errorMatch) {
      return error;
    }
    return errorMatch.map((e) => JSON.parse(e));
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    history.push({
      pathname: `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
        projectGuid,
        irtGuid,
        newTab
      )}`,
      state: { current: 2 },
    });
  };

  const next = () => {
    if (location?.state?.current) {
      history.replace(location.pathname, null);
    }
    setCurrent((location.state.current += 1));
  };

  const prev = () => {
    if (location?.state?.current) {
      history.replace(location.pathname, null);
    }
    setCurrent((location.state.current -= 1));
  };

  const importIsSuccessful = async (success, err) => {
    if (!success) {
      const hasBadRequestError = err?.message.includes("400 Bad Request: [");
      const formattedError = marshalImportIRTError(err?.message);
      await handleFetchData();

      setHasBadRequestError(hasBadRequestError);
      setImportFailed(true);
      setImportErrors(formattedError);
      return;
    }

    await handleFetchData();
    setUploadedSuccessfully(true);
    setEditMode(!isEditMode);
    return cleanFilePondFile();
  };

  const handleIRTUpdate = async (values: any, message: string) => {
    const projectGuid = project.project_guid;
    const informationRequirementsTableGuid = project.information_requirements_table.irt_guid;
    setSubmitting(true);

    await dispatch(
      updateInformationRequirementsTable(
        {
          projectGuid,
          informationRequirementsTableGuid,
        },
        values,
        message
      )
    );
    setSubmitting(false);
    handleFetchData();

    history.push({
      pathname: `${routes.INFORMATION_REQUIREMENTS_TABLE_SUCCESS.dynamicRoute(
        projectGuid,
        informationRequirementsTableGuid
      )}`,
      state: { project },
    });
  };

  const handleIRTStatusUpdate = async (values: any, message: string) => {
    const projectGuid = project.project_guid;
    const informationRequirementsTableGuid = project.information_requirements_table.irt_guid;
    setSubmitting(true);

    await dispatch(
      updateInformationRequirementsTableStatus(
        {
          projectGuid,
          informationRequirementsTableGuid,
        },
        values,
        message
      )
    );
    setSubmitting(false);
    handleFetchData();

    history.push({
      pathname: `${routes.INFORMATION_REQUIREMENTS_TABLE_SUCCESS.dynamicRoute(
        projectGuid,
        informationRequirementsTableGuid
      )}`,
      state: { project },
    });
  };

  const downloadIRTTemplate = (url: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  const openViewFileHistoryModal = () => {
    dispatch(
      openModal({
        props: {
          project: project,
          title: " View File History",
          documentCategoryOptionsHash: informationRequirementsTableDocumentTypesHash,
          width: 650,
        },
        content: modalConfig.VIEW_FILE_HISTORY,
      })
    );
  };

  const title =
    project.information_requirements_table?.status_code !== "DFT"
      ? project?.project_title
      : `Major Mine Submission - ${project?.project_title}`;

  const Forms = StepForms({
    informationRequirementsTableDocumentTypesHash,
    project,
    requirements: requirements.filter((r) => r.version === projectRequirementsVersion),
    tabs,
    uploadedSuccessfully,
    next,
    prev,
    submitting,
    handleTabChange,
    handleIRTUpdate,
    handleIRTStatusUpdate,
    importIsSuccessful,
    downloadIRTTemplate,
    openViewFileHistoryModal,
    activeTab,
  });

  return (
    isLoaded && (
      <>
        <>
          <Row>
            <Col span={24}>
              <Typography.Title>{title}</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={routes.EDIT_PROJECT.dynamicRoute(project.project_guid)}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to: {project.project_title} Project Overview page
              </Link>
            </Col>
          </Row>
          <br />
        </>

        <Row>
          <Col span={12}>
            <Typography.Title level={2}>Information Requirements Table</Typography.Title>
          </Col>
          <Col span={12}>
            <div style={{ display: "inline", float: "right" }}>
              <p>{Forms[current].buttons}</p>
            </div>
          </Col>
        </Row>
        <Row>
          {project?.information_requirements_table?.status_code !== "APV" && (
            <Steps current={current} items={Forms} />
          )}
          <br />
          <br />
          <Col span={24}>
            {current !== 0 && (
              <InformationRequirementsTableCallout
                informationRequirementsTableStatus={
                  project?.information_requirements_table?.status_code || "DFT"
                }
              />
            )}
            <div>{Forms[current].content}</div>
          </Col>
        </Row>
      </>
    )
  );
};

export default withRouter(InformationRequirementsTablePage);
