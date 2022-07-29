import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { change, submit, getFormSyncErrors, getFormValues, reset, touch } from "redux-form";
import { Button, Row, Col, Popconfirm, Steps, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import customPropTypes from "@/customPropTypes";
import { flattenObject } from "@common/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import * as FORM from "@/constants/forms";
import { getProject } from "@common/reducers/projectReducer";
import { getMines } from "@common/selectors/mineSelectors";
import {
  fetchProjectById,
  createMajorMineApplication,
  updateMajorMineApplication,
} from "@common/actionCreators/projectActionCreator";
import { clearMajorMinesApplication } from "@common/actions/projectActions";
import { getMajorMinesApplicationDocumentTypesHash } from "@common/selectors/staticContentSelectors";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import { MajorMineApplicationGetStarted } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationGetStarted";
import * as routes from "@/constants/routes";

const propTypes = {
  mines: PropTypes.arrayOf(customPropTypes.mine).isRequired,
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

const StepForms = (props, mineName, primaryContact, state, next, prev, handleSaveData) => [
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
                  ...(props.formValues?.primary || []),
                  ...(props.formValues?.spatial || []),
                  ...(props.formValues?.supporting || []),
                ],
                status_code: "DFT",
              },
              "Successfully saved a draft major mine application."
            )
          }
          disabled={!props.formValues?.primary?.length > 0}
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
          onClick={() => next()}
          disabled={!props.formValues?.primary?.length > 0}
        >
          Review & Submit
        </Button>
      </>,
    ],
  },
  {
    title: "Review & Submit",
    content: <></>,
    buttons: [
      <>
        <Button
          id="step-back2"
          type="tertiary"
          className="full-mobile"
          style={{ marginRight: "24px" }}
          onClick={() => prev()}
        >
          Back
        </Button>
        ,
        <Link>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to submit your final IRT, no changes could be made after submitting?"
            onConfirm={() => {}}
            okText="Yes"
            cancelText="No"
          >
            <Button id="submit_irt" type="primary">
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
  };

  componentDidMount() {
    this.handleFetchData();
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
      await this.handleFetchData();
      const { project = {} } = this.props;
      const majorMineApplicationGuid = project?.major_mine_application?.major_mine_application_guid;
      return this.props.history.push({
        pathname: `${routes.MAJOR_MINE_APPLICATION_SUCCESS.dynamicRoute(
          project?.project_guid,
          majorMineApplicationGuid
        )}`,
        state: { project },
      });
    }
    return null;
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  render() {
    const mineGuid = this.props.project?.mine_guid;
    const mineName = this.props.mines[mineGuid]?.mine_name || "";
    const title = `Major Mine Application - ${mineName}`;

    const primaryContact = this.props.project?.contacts
      .filter((contact) => contact.is_primary === true)
      .map((primary) => primary.name)[0];

    const Forms = StepForms(
      this.props,
      mineName,
      primaryContact,
      this.state,
      this.next,
      this.prev,
      this.handleSaveData
    );

    return (
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
  mines: getMines(state),
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
