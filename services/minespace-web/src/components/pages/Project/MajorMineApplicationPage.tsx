import React, { FC, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFormValues, isDirty, submit } from "redux-form";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { Button, Row, Col, Popconfirm, Steps, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getProject } from "@mds/common/redux/reducers/projectReducer";
import {
  fetchProjectById,
  createMajorMineApplication,
  updateMajorMineApplication,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { clearMajorMinesApplication } from "@mds/common/redux/actions/projectActions";
import { FORM } from "@mds/common/constants/forms";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import { MajorMineApplicationGetStarted } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationGetStarted";
import MajorMineApplicationReviewSubmit from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationReviewSubmit";
import MajorMineApplicationCallout from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationCallout";
import * as routes from "@/constants/routes";
import { fetchMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import Loading from "@mds/common/components/common/Loading";

import FormWrapper from "@mds/common/components/forms/FormWrapper";

export const MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES = ["SUB", "UNR", "APV"];

export const MajorMineApplicationPage: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { projectGuid } = useParams<{ projectGuid: string }>();
  const project = useSelector(getProject);
  const formValues = useSelector(getFormValues(FORM.ADD_MINE_MAJOR_APPLICATION));
  const isFormDirty = useSelector(isDirty(FORM.ADD_MINE_MAJOR_APPLICATION));

  const { state: routeState } = useLocation<{ current: number }>();
  const defaultCurrent = routeState?.current ?? 0;
  const [current, setCurrent] = useState(defaultCurrent);

  const [loaded, setLoaded] = useState(false);
  const [confirmedSubmission, setConfirmedSubmission] = useState(false);
  const majorMineApplicationGuid =
    project?.major_mine_application?.major_mine_application_guid ??
    formValues?.major_mine_application_guid;

  const mineName = project?.mine_name ?? "";
  const title = `Major Mine Application - ${mineName}`;
  const primaryContact = project?.contacts?.filter((contact) => contact.is_primary === true)[0];

  const applicationStatus = project?.major_mine_application?.status_code;
  const applicationSubmitted = MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES.includes(
    applicationStatus
  );

  const toggleConfirmedSubmission = () => setConfirmedSubmission(!confirmedSubmission);

  const handleFetchData = async () => {
    setLoaded(false);
    const proj = await dispatch(fetchProjectById(projectGuid));
    const mmaGuid = proj?.major_mine_application?.major_mine_application_guid;

    if (mmaGuid) {
      await dispatch(
        fetchMineDocuments(proj.mine_guid, {
          is_archived: true,
          major_mine_application_guid: mmaGuid,
        })
      );
    }
    setLoaded(true);
  };

  useEffect(() => {
    handleFetchData();

    return () => {
      dispatch(clearMajorMinesApplication);
    };
  }, []);

  const handleCreateMajorMineApplication = (values, isDraft) => {
    const message = isDraft ? "Successfully create a draft major mine application." : null;
    return dispatch(createMajorMineApplication({ projectGuid }, values, message)).then(
      (response) => {
        return response?.data;
      }
    );
  };

  const handleUpdateMajorMineApplication = (values, isDraft) => {
    const { project_guid, major_mine_application_guid } = values;

    let message = null;
    if (isDraft) {
      message = "Successfully updated draft major mine application.";
    } else if (current === 2) {
      message = "Successfully submitted a new major mine application";
    }
    return dispatch(
      updateMajorMineApplication(
        { projectGuid: project_guid, majorMineApplicationGuid: major_mine_application_guid },
        values,
        message
      )
    ).then(() => handleFetchData());
  };

  const handleSaveData = async (values, isDraft) => {
    setLoaded(false);
    const mmaExists = Boolean(values?.major_mine_application_guid);
    if (!mmaExists) {
      return handleCreateMajorMineApplication(values, isDraft);
    }
    return handleUpdateMajorMineApplication(values, isDraft);
  };

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

  const transformPayload = (values, status_code = "DFT") => {
    const documents = [
      ...(values?.primary_documents || []),
      ...(values?.spatial_documents || []),
      ...(values?.supporting_documents || []),
    ];
    return { ...values, documents, status_code };
  };

  const handleSubmit = async (values) => {
    const isReviewPage = current === 2;
    const status_code = isReviewPage ? "SUB" : values?.status_code ?? "DFT";
    const payload = transformPayload(values, status_code);
    const response = await handleSaveData(payload, false);
    const mmaGuid =
      project?.major_mine_application?.major_mine_application_guid ??
      response?.major_mine_application_guid;

    if (isReviewPage) {
      return history.push({
        pathname: routes.MAJOR_MINE_APPLICATION_SUCCESS.dynamicRoute(projectGuid, mmaGuid),
        state: { project },
      });
    }

    if (mmaGuid) {
      return history.push({
        pathname: routes.REVIEW_MAJOR_MINE_APPLICATION.dynamicRoute(
          projectGuid,
          majorMineApplicationGuid
        ),
        state: { current: 2 },
      });
    }
  };

  const handleSaveDraft = async (e) => {
    if (e) {
      e.preventDefault();
    }
    const payload = transformPayload(formValues);
    await handleSaveData(payload, true);
    handleFetchData();
  };

  const stepItems = [
    {
      title: "Get Started",
      content: <MajorMineApplicationGetStarted />,
      buttons: [
        <React.Fragment key="step-1-buttons">
          <Link to={routes.EDIT_PROJECT.dynamicRoute(project?.project_guid)}>
            <Button id="step1-cancel" type="default" style={{ marginRight: "15px" }}>
              Cancel
            </Button>
          </Link>
          <Button id="step1-next" type="primary" onClick={next}>
            Next
          </Button>
        </React.Fragment>,
      ],
    },
    {
      title: "Create Submission",
      content: <MajorMineApplicationForm refreshData={handleFetchData} project={project} />,
      buttons: [
        <React.Fragment key="step-2-buttons">
          {isFormDirty && (
            <Button type="link" style={{ marginRight: "15px" }} onClick={handleSaveDraft}>
              Save Draft
            </Button>
          )}
          <Button
            id="step-back"
            type="default"
            className="full-mobile"
            style={{ marginRight: "20px" }}
            onClick={prev}
          >
            Back
          </Button>
          <Button
            id="step2-next"
            type="primary"
            htmlType="submit"
            disabled={formValues?.primary_documents?.length === 0 || !isFormDirty}
          >
            Review & Submit
          </Button>
        </React.Fragment>,
      ],
    },
    {
      title: "Review & Submit",
      content: (
        <MajorMineApplicationReviewSubmit
          setConfirmedSubmission={toggleConfirmedSubmission}
          confirmedSubmission={confirmedSubmission}
          project={project}
          refreshData={handleFetchData}
        />
      ),
      buttons: [
        <React.Fragment key="step-3-buttons">
          <Button
            id="step-back2"
            type="default"
            className="full-mobile"
            style={{ marginRight: "24px" }}
            onClick={() => {
              history.push({
                pathname: routes.EDIT_MAJOR_MINE_APPLICATION.dynamicRoute(
                  projectGuid,
                  majorMineApplicationGuid
                ),
                state: { current: 1 },
              });
            }}
          >
            Back
          </Button>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to submit your final major mine application? No changes can be made after submitting."
            okText="Yes"
            cancelText="No"
            onConfirm={async (e) => dispatch(submit(FORM.ADD_MINE_MAJOR_APPLICATION))}
          >
            <Button
              id="submit_irt"
              type="primary"
              htmlType="submit"
              disabled={!confirmedSubmission}
            >
              Submit Now
            </Button>
          </Popconfirm>
        </React.Fragment>,
      ],
    },
  ];

  const getContactName = (contact) => {
    if (!contact) {
      return;
    }
    if (contact?.company_name) {
      return contact.company_name;
    }
    return [contact?.first_name, contact?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  const initialValues = {
    mine_name: mineName,
    primary_contact: getContactName(primaryContact),
    primary_documents:
      project?.major_mine_application?.documents?.filter(
        (d) => d.major_mine_application_document_type_code === "PRM"
      ) ?? [],
    spatial_documents:
      project?.major_mine_application?.documents?.filter(
        (d) => d.major_mine_application_document_type_code === "SPT"
      ) ?? [],
    supporting_documents:
      project?.major_mine_application?.documents?.filter(
        (d) => d.major_mine_application_document_type_code === "SPR"
      ) ?? [],
    ...project?.major_mine_application,
  };

  return loaded ? (
    <FormWrapper
      name={FORM.ADD_MINE_MAJOR_APPLICATION}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      reduxFormConfig={{
        destroyOnUnmount: true,
      }}
    >
      <Row>
        <Col span={24}>
          <Typography.Title>{title}</Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Link to={routes.EDIT_PROJECT.dynamicRoute(projectGuid)}>
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to: {project.project_title} Project Overview page
          </Link>
        </Col>
      </Row>
      <br />
      <Row>
        <Col span={15}>
          <Typography.Title level={2}>Create New Major Mine Application</Typography.Title>
        </Col>
        <Col span={9}>
          {!applicationSubmitted && (
            <div style={{ display: "inline", float: "right" }}>
              <p>{stepItems[current].buttons}</p>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Steps
          current={current}
          style={{ marginLeft: "8%", marginRight: "8%" }}
          items={stepItems}
        />
      </Row>
      <br />
      <Row>
        <Col span={24}>
          {current !== 0 && (
            <MajorMineApplicationCallout
              majorMineApplicationStatus={project?.major_mine_application?.status_code}
            />
          )}
          <div>{stepItems[current].content}</div>
        </Col>
      </Row>
      {!applicationSubmitted && (
        <Row>
          <Col span={24}>
            <div style={{ display: "inline", float: "right" }}>
              <p>{stepItems[current].buttons}</p>
            </div>
          </Col>
        </Row>
      )}
    </FormWrapper>
  ) : (
    <Loading />
  );
};
export default MajorMineApplicationPage;
