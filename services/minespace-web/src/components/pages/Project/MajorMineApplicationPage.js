import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { change, submit, getFormSyncErrors, getFormValues, reset, touch } from "redux-form";
import { Button, Row, Col, Popconfirm, Steps, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { flattenObject } from "@common/utils/helpers";
import { getProject } from "@common/reducers/projectReducer";
import {
  fetchProjectById,
  createMajorMineApplication,
  updateMajorMineApplication,
} from "@common/actionCreators/projectActionCreator";
import { clearMajorMinesApplication } from "@common/actions/projectActions";
import { getMajorMinesApplicationDocumentTypesHash } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import LinkButton from "@/components/common/LinkButton";
import customPropTypes from "@/customPropTypes";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import { MajorMineApplicationGetStarted } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationGetStarted";
import MajorMineApplicationReviewSubmit from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationReviewSubmit";
import * as routes from "@/constants/routes";

const propTypes = {
  project: customPropTypes.project.isRequired,
  clearMajorMinesApplication: PropTypes.func.isRequired,
  createMajorMineApplication: PropTypes.func.isRequired,
  updateMajorMineApplication: PropTypes.func.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  majorMinesApplicationDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: {
      projectGuid: PropTypes.string,
    },
  }).isRequired,
  location: PropTypes.shape({
    state: {
      current: PropTypes.number,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  touch: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  // eslint-disable-next-line react/no-unused-prop-types
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {
  formErrors: {},
};

const StepForms = (
  props,
  mineName,
  primaryContact,
  state,
  next,
  prev,
  handleSaveData,
  setConfirmedSubmission
) => [
  {
    title: "Get Started",
    content: <MajorMineApplicationGetStarted />,
    buttons: [
      <>
        <Link to={routes.EDIT_PROJECT.dynamicRoute(props.project?.project_guid)}>
          <Button
            id="step1-cancel"
            type="secondary"
            style={{ marginRight: "15px" }}
            onClick={() => {}}
          >
            Cancel
          </Button>
        </Link>
        <Button id="step1-next" type="primary" onClick={() => next()}>
          Next
        </Button>
      </>,
    ],
  },
  {
    title: "Create Submission",
    content: (
      <MajorMineApplicationForm
        isEditMode={state.isEditMode}
        initialValues={{
          mine_name: mineName,
          primary_contact: primaryContact,
          primary_documents: props.project.major_mine_application?.documents?.filter(
            (d) => d.major_mine_application_document_type_code === "PRM"
          ),
          spatial_documents: props.project.major_mine_application?.documents?.filter(
            (d) => d.major_mine_application_document_type_code === "SPT"
          ),
          supporting_documents: props.project.major_mine_application?.documents?.filter(
            (d) => d.major_mine_application_document_type_code === "SPR"
          ),
          ...props.project.major_mine_application,
        }}
        project={props.project}
        majorMinesApplicationDocumentTypesHash={props.majorMinesApplicationDocumentTypesHash}
      />
    ),
    buttons: [
      <>
        <LinkButton
          style={{ marginRight: "20px" }}
          onClick={(e) =>
            handleSaveData(
              e,
              {
                ...props.formValues,
                documents: [
                  ...(props.formValues?.primary_documents || []),
                  ...(props.formValues?.spatial_documents || []),
                  ...(props.formValues?.supporting_documents || []),
                ],
                status_code: "DFT",
              },
              "Successfully saved a draft major mine application."
            )
          }
          disabled={!props.formValues?.primary_documents?.length > 0}
          title="Save Draft"
        >
          Save Draft
        </LinkButton>
        <Button
          id="step-back"
          type="tertiary"
          className="full-mobile"
          style={{ marginRight: "20px" }}
          onClick={() => prev()}
        >
          Back
        </Button>
        <Button
          id="step2-next"
          type="primary"
          onClick={() => {
            props.history.push({
              pathname: `${routes.REVIEW_MAJOR_MINE_APPLICATION.dynamicRoute(
                props.project?.project_guid,
                props.project?.major_mine_application?.major_mine_application_guid
              )}`,
              state: { current: 2 },
            });
          }}
          disabled={!props.formValues?.primary_documents?.length > 0}
        >
          Review & Submit
        </Button>
      </>,
    ],
  },
  {
    title: "Review & Submit",
    content: (
      <MajorMineApplicationReviewSubmit
        setConfirmedSubmission={setConfirmedSubmission}
        confirmedSubmission={state.confirmedSubmission}
        project={props.project}
      />
    ),
    buttons: [
      <>
        <Button
          id="step-back2"
          type="tertiary"
          className="full-mobile"
          style={{ marginRight: "24px" }}
          onClick={() => {
            props.history.push({
              pathname: `${routes.ADD_MAJOR_MINE_APPLICATION.dynamicRoute(
                props.project.project_guid
              )}`,
              state: { current: 1 },
            });
          }}
        >
          Back
        </Button>
        <Link>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to submit your final major mine application? No changes can be made after submitting."
            onConfirm={(e) => {
              handleSaveData(
                e,
                {
                  ...props.formValues,
                  documents: [
                    ...(props.formValues?.primary_documents || []),
                    ...(props.formValues?.spatial_documents || []),
                    ...(props.formValues?.supporting_documents || []),
                  ],
                  status_code: "REC",
                },
                "Successfully saved a draft major mine application."
              );
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button id="submit_irt" type="primary" disabled={!state.confirmedSubmission}>
              Submit Now
            </Button>
          </Popconfirm>
        </Link>
      </>,
    ],
  },
];

export class MajorMineApplicationPage extends Component {
  state = {
    current: 0,
    isEditMode: false,
    isLoaded: false,
    confirmedSubmission: false,
  };

  componentDidMount() {
    this.handleFetchData().then(() => {
      this.setState((prevState) => ({
        current: this.props.location?.state?.current || prevState.current,
      }));
    });
  }

  componentWillUnmount() {
    this.props.clearMajorMinesApplication();
  }

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;

    return this.props
      .fetchProjectById(projectGuid)
      .then(() =>
        this.props.project.major_mine_application?.major_mine_application_guid
          ? this.setState({ isLoaded: true, isEditMode: true })
          : this.setState({ isLoaded: true, isEditMode: false })
      );
  };

  handleCreateMajorMineApplication = (values, message) => {
    return this.props.createMajorMineApplication(
      {
        projectGuid: this.props.match.params?.projectGuid,
      },
      values,
      message
    );
  };

  handleUpdateMajorMineApplication = (values, message) => {
    const {
      project_guid: projectGuid,
      major_mine_application_guid: majorMineApplicationGuid,
    } = values;
    return this.props
      .updateMajorMineApplication(
        {
          projectGuid,
          majorMineApplicationGuid,
        },
        values,
        message
      )
      .then(() => {
        this.handleFetchData();
      });
  };

  handleSaveData = async (e, values, message) => {
    e.preventDefault();
    this.props.submit(FORM.ADD_MINE_MAJOR_APPLICATION);
    this.props.touch(FORM.ADD_MINE_MAJOR_APPLICATION);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      if (!this.state.isEditMode) {
        await this.handleCreateMajorMineApplication(values, message);
      } else {
        await this.handleUpdateMajorMineApplication(values, message);
      }
      if (values?.status_code === "REC") {
        return this.props.history.push({
          pathname: `${routes.MAJOR_MINE_APPLICATION_SUCCESS.dynamicRoute(
            this.props.match.params?.projectGuid,
            this.props.match.params?.majorMineApplicationGuid
          )}`,
          state: { project: this.props.project },
        });
      }
    }
    return null;
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  setConfirmedSubmission = () =>
    this.setState((prevState) => ({ confirmedSubmission: !prevState.confirmedSubmission }));

  render() {
    const mineName = this.props.project?.mine_name || "";
    const title = `Major Mine Application - ${mineName}`;
    const primaryContact = this.props.project?.contacts
      ?.filter((contact) => contact.is_primary === true)
      .map((primary) => primary.name)[0];

    const Forms = StepForms(
      this.props,
      mineName,
      primaryContact,
      this.state,
      this.next,
      this.prev,
      this.handleSaveData,
      this.setConfirmedSubmission
    );

    return (
      this.state.isLoaded && (
        <>
          <Row>
            <Col span={24}>
              <Typography.Title>{title}</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={routes.EDIT_PROJECT.dynamicRoute(this.props.project?.project_guid)}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to: {this.props.project.project_title} Project Overview page
              </Link>
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={16}>
              <Typography.Title level={2}>Create New Major Mine Application</Typography.Title>
            </Col>
            <Col span={8}>
              <div style={{ display: "inline", float: "right" }}>
                <p>{Forms[this.state.current].buttons}</p>
              </div>
            </Col>
          </Row>
          <Row>
            <Steps current={this.state.current} style={{ marginLeft: "8%", marginRight: "8%" }}>
              {Forms.map((step) => (
                <Steps.Step key={step.title} title={step.title} />
              ))}
            </Steps>
          </Row>
          <br />
          <Row>
            <Col span={24}>
              <div>{Forms[this.state.current].content}</div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <div style={{ display: "inline", float: "right" }}>
                <p>{Forms[this.state.current].buttons}</p>
              </div>
            </Col>
          </Row>
        </>
      )
    );
  }
}

MajorMineApplicationPage.propTypes = propTypes;
MajorMineApplicationPage.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  anyTouched: state.form[FORM.ADD_MINE_MAJOR_APPLICATION]?.anyTouched || false,
  fieldsTouched: state.form[FORM.ADD_MINE_MAJOR_APPLICATION]?.fields || {},
  project: getProject(state),
  majorMinesApplicationDocumentTypesHash: getMajorMinesApplicationDocumentTypesHash(state),
  formErrors: getFormSyncErrors(FORM.ADD_MINE_MAJOR_APPLICATION)(state),
  formValues: getFormValues(FORM.ADD_MINE_MAJOR_APPLICATION)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createMajorMineApplication,
      updateMajorMineApplication,
      fetchProjectById,
      clearMajorMinesApplication,
      submit,
      reset,
      touch,
      change,
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MajorMineApplicationPage));
