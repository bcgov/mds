import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link, withRouter } from "react-router-dom";
import { Row, Col, Button, Typography, Steps } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getProject, getRequirements } from "@common/selectors/projectSelectors";
import { clearInformationRequirementsTable } from "@common/actions/projectActions";
import {
  fetchProjectById,
  fetchRequirements,
  updateInformationRequirementsTable,
} from "@common/actionCreators/projectActionCreator";
import Callout from "@/components/common/Callout";
import { EDIT_PROJECT } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import IRTDownloadTemplate from "../../Forms/projects/informationRequirementsTable/IRTDownloadTemplate";
import IRTFileImport from "../../Forms/projects/informationRequirementsTable/IRTFileImport";
import { InformationRequirementsTableForm } from "../../Forms/projects/informationRequirementsTable/InformationRequirementsTableForm";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  updateInformationRequirementsTable: PropTypes.func.isRequired,
  requirements: PropTypes.arrayOf(CustomPropTypes.requirements).isRequired,
  fetchRequirements: PropTypes.func.isRequired,
  clearInformationRequirementsTable: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  match: PropTypes.shape({
    params: {
      projectGuid: PropTypes.string,
      tab: PropTypes.string,
    },
  }).isRequired,
  location: PropTypes.shape({
    state: {
      current: PropTypes.number,
    },
  }).isRequired,
};

const tabs = [
  "intro-project-overview",
  "baseline-information",
  "mine-plan",
  "reclamation-closure-plan",
  "modelling-mitigation-discharges",
  "environmental-assessment-predictions",
  "environmental-monitoring",
  "health-safety",
  "management-plan",
];

const StepForms = (
  props,
  state,
  next,
  prev,
  handleTabChange,
  handleIRTUpdate,
  importIsSuccessful
) => [
  {
    title: "Download Template",
    content: <IRTDownloadTemplate />,
    buttons: [
      null,
      <Button id="step1-next" type="tertiary" onClick={() => next()}>
        Next
      </Button>,
    ],
  },
  {
    title: "Import File",
    content: (
      <IRTFileImport
        projectGuid={props.project?.project_guid}
        importIsSuccessful={importIsSuccessful}
      />
    ),
    buttons: [
      <Button
        id="step-back"
        style={{ display: "inline", float: "left" }}
        type="tertiary"
        className="full-mobile"
        onClick={() => prev()}
        disabled={state.submitting}
      >
        Back
      </Button>,
      <Button
        id="step2-next"
        style={{ display: "inline", float: "right" }}
        type="tertiary"
        onClick={() => {
          props.history.push({
            pathname: `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
              props.project?.project_guid,
              props.project?.information_requirements_table?.irt_guid
            )}`,
            state: { current: 2 },
          });
        }}
        disabled={
          !state.uploadedSuccessfully && !props.project?.information_requirements_table?.irt_guid
        }
      >
        Next
      </Button>,
    ],
  },
  {
    title: "Review & Submit",
    content: (
      <>
        <Typography.Title level={4}>Review and Submit</Typography.Title>
        <Callout
          message={
            <>
              Review imported data before submission. Check the requirements and comments fields
              that are required for the project.
            </>
          }
        />

        <InformationRequirementsTableForm
          project={props.project}
          informationRequirementsTable={props.project?.information_requirements_table}
          requirements={props.requirements}
          tab={props.match?.params?.tab}
          isEditMode={state.isEditMode}
          handleTabChange={handleTabChange}
        />
      </>
    ),
    buttons: [
      <Button
        id="step-back"
        style={{ display: "inline", float: "left" }}
        type="tertiary"
        className="full-mobile"
        onClick={() => {
          props.history.push({
            pathname: `${routes.ADD_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
              props.project.project_guid
            )}`,
            state: { current: 1 },
          });
        }}
        disabled={props.project?.information_requirements_table?.status_code === "APV"}
      >
        Back
      </Button>,
      <Link
        to={routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
          props.project?.project_guid,
          props.project?.information_requirements_table?.irt_guid
        )}
      >
        <Button
          type="primary"
          style={{ display: "inline", float: "right" }}
          htmlType="submit"
          onClick={() => handleIRTUpdate({ status_code: "UNR" }, "IRT submitted ")}
          disabled={state.submitting}
        >
          Submit IRT
        </Button>
      </Link>,
    ],
  },
];

export class InformationRequirementsTablePage extends Component {
  state = {
    current: 0,
    submitting: false,
    isLoaded: false,
    isEditMode: false,
    activeTab: tabs[0],
    informationRequirementsTable: [],
    uploadedSuccessfully: false,
  };

  componentDidMount() {
    const { history } = this.props;
    this.handleFetchData().then(() => {
      this.setState((prevState) => ({
        current: this.props.location?.state?.current || prevState.current,
      }));
      // eslint-disable-next-line no-unused-expressions
      history?.replace();
    });
  }

  componentWillUnmount() {
    this.props.clearInformationRequirementsTable();
  }

  handleTabChange = (activeTab) => {
    const { projectGuid, irtGuid } = this.props.match.params;
    this.props.history.push({
      pathname: `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
        projectGuid,
        irtGuid,
        activeTab
      )}`,
      state: { current: 2 },
    });
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  importIsSuccessful = () => {
    this.handleFetchData();
    this.setState((state) => ({ uploadedSuccessfully: !state.uploadedSuccessfully }));
  };

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;

    return this.props
      .fetchProjectById(projectGuid)
      .then(() => this.props.fetchRequirements())
      .then(() => this.setState({ isLoaded: true }));
  };

  handleIRTUpdate = (values, message) => {
    const projectGuid = this.props.project.project_guid;
    const informationRequirementsTableGuid = this.props.project.information_requirements_table
      .irt_guid;
    this.setState({ submitting: true });
    return this.props
      .updateInformationRequirementsTable(
        {
          projectGuid,
          informationRequirementsTableGuid,
        },
        values,
        message
      )
      .then(() => {
        this.handleFetchData();
        this.setState({ submitting: false });
      });
  };

  render() {
    const title = this.state.isEditMode
      ? `Edit IRT - ${this.props.project?.project_title}`
      : `Final IRT - ${this.props.project?.project_title}`;

    const Forms = StepForms(
      this.props,
      this.state,
      this.next,
      this.prev,
      this.handleTabChange,
      this.handleIRTUpdate,
      this.importIsSuccessful
    );
    // Button placement on last stage is below content which is offset due to vertical tabs
    const buttonGroupColumnConfig =
      this.props.location?.state?.current === 2 || this.state.current === 2
        ? { md: { span: 4, offset: 5 } }
        : { md: 4 };

    return (
      this.state.isLoaded && (
        <>
          {!this.state.projectActiveTab && (
            <>
              <Row>
                <Col span={24}>
                  <Typography.Title>{title}</Typography.Title>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Link
                    to={EDIT_PROJECT.dynamicRoute(this.props.project.project_summary.project_guid)}
                  >
                    <ArrowLeftOutlined className="padding-sm--right" />
                    Back to: {this.props.project.project_title} Project Overview page
                  </Link>
                </Col>
              </Row>
              <br />
            </>
          )}
          <Row>
            <Steps current={this.props.location.state?.current || this.state.current}>
              {Forms.map((step) => (
                <Steps.Step key={step.title} title={step.title} />
              ))}
            </Steps>
            <br />
            <br />
            <Col span={24}>
              <div>{Forms[this.props.location.state?.current || this.state.current].content}</div>
            </Col>
            <Col xs={24} {...buttonGroupColumnConfig}>
              <div>{Forms[this.props.location.state?.current || this.state.current].buttons}</div>
            </Col>
          </Row>
        </>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  requirements: getRequirements(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearInformationRequirementsTable,
      fetchProjectById,
      fetchRequirements,
      updateInformationRequirementsTable,
    },
    dispatch
  );

InformationRequirementsTablePage.propTypes = propTypes;

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(InformationRequirementsTablePage)
);
