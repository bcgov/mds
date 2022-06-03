import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link, withRouter } from "react-router-dom";
import { Row, Col, Button, Typography, Steps, Popconfirm } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import Callout from "@/components/common/Callout";
import { getProject, getRequirements } from "@common/selectors/projectSelectors";
import { clearInformationRequirementsTable } from "@common/actions/projectActions";
import { fetchProjectById, fetchRequirements } from "@common/actionCreators/projectActionCreator";
import { EDIT_PROJECT } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import IRTDownloadTemplate from "../../Forms/projects/informationRequirementsTable/IRTDownloadTemplate";
import IRTFileImport from "../../Forms/projects/informationRequirementsTable/IRTFileImport";
import { InformationRequirementsTableForm } from "../../Forms/projects/informationRequirementsTable/InformationRequirementsTableForm";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  requirements: PropTypes.arrayOf(CustomPropTypes.requirements).isRequired,
  fetchRequirements: PropTypes.func.isRequired,
  clearInformationRequirementsTable: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  match: PropTypes.shape({
    params: {
      projectGuid: PropTypes.string,
      tab: PropTypes.string,
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

const StepForms = (props, state, next, prev, close, handleTabChange, handleIRTSubmit) => [
  {
    title: "Download template",
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
    content: <IRTFileImport projectGuid={props.project.project_guid} />,
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
          props.history.replace(
            `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
              props.project?.project_guid
            )}`
          );
          next();
        }}
        disabled={state.submitting}
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
          informationRequirementsTable={props.project.information_requirements_table}
          requirements={props.requirements}
          tab={props.match.params.tab}
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
          prev();
          props.history.push(
            routes.ADD_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(props.project.project_guid)
          );
        }}
        disabled={state.submitting}
      >
        Back
      </Button>,
      <Popconfirm
        placement="top"
        title="Are you sure you want to cancel the submission for this IRT?"
        okText="Yes"
        cancelText="No"
        onConfirm={() => {
          this.close();
        }}
        disabled={state.submitting}
      >
        <Button type="secondary" className="full-mobile" disabled={state.submitting}>
          Cancel
        </Button>
      </Popconfirm>,
      <Button
        type="primary"
        style={{ display: "inline", float: "right" }}
        htmlType="submit"
        onClick={(event) => {
          handleIRTSubmit(event);
        }}
        disabled={state.submitting}
      >
        Submit IRT
      </Button>,
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
  };

  componentDidMount() {
    this.handleFetchData();
  }

  componentWillUnmount() {
    this.props.clearInformationRequirementsTable();
  }

  handleTabChange = (activeTab) => {
    const url = routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
      this.props.match.params?.projectGuid,
      activeTab
    );
    this.setState({ activeTab });
    this.props.history.push(url);
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  close = () => {};

  onChange = (value) => {
    this.setState({ current: value });
  };

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;

    return this.props
      .fetchProjectById(projectGuid)
      .then(() => this.props.fetchRequirements())
      .then(() => this.setState({ isLoaded: true }));
  };

  handleIRTSubmit = () => {
    this.setState({ submitting: true });
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
      this.close,
      this.handleTabChange
    );
    // Button placement on last stage is below content which is offset due to vertical tabs
    const buttonGroupColumnConfig =
      this.state.current === 2 ? { md: { span: 6, offset: 6 } } : { md: 6 };

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
            <Steps current={this.state.current} onChange={this.onChange}>
              {Forms.map((step) => (
                <Steps.Step key={step.title} title={step.title} />
              ))}
            </Steps>
            <br />
            <br />
            <Col span={24}>
              <div>{Forms[this.state.current].content}</div>
            </Col>
            <Col xs={24} {...buttonGroupColumnConfig}>
              <div>{Forms[this.state.current].buttons}</div>
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
    },
    dispatch
  );

InformationRequirementsTablePage.propTypes = propTypes;

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(InformationRequirementsTablePage)
);
