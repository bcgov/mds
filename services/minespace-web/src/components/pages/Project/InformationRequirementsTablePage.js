import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { Row, Col, Button, Typography, Divider, Steps } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getProject, getInformationRequirementsTable } from "@common/selectors/projectSelectors";
import { clearInformationRequirementsTable } from "@common/actions/projectActions";
import { fetchProjectById } from "@common/actionCreators/projectActionCreator";
import { EDIT_PROJECT } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import IRTDownloadTemplate from "../../Forms/projects/informationRequirementsTable/IRTDownloadTemplate";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  clearInformationRequirementsTable: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
};

const StepForms = (props, state, next, prev, handleIRTSubmit) => [
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
    title: "Import",
    content: (
      <>
        <br />
      </>
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
        onClick={() => next()}
        disabled={state.submitting}
      >
        Next
      </Button>,
    ],
  },
  {
    title: "Review / Submit",
    content: (
      <>
        <br />
      </>
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
        type="primary"
        style={{ display: "inline", float: "right" }}
        htmlType="submit"
        onClick={(event) => handleIRTSubmit(event)}
        disabled={state.submitting}
      >
        Submit final IRT
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
  };

  componentDidMount() {
    this.handleFetchData();
  }

  componentWillUnmount() {
    this.props.clearInformationRequirementsTable();
  }

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  handleFetchData = () => {
    const { projectGuid, tab } = this.props.match?.params;
    if (projectGuid) {
      return this.props
        .fetchProjectById(projectGuid)
        .then(() => this.setState({ isLoaded: true, activeTab: tab }));
    }
    return this.props.fetchProjectById(projectGuid).then(() => {
      this.setState({ isLoaded: true, activeTab: tab });
    });
  };

  render() {
    const title = this.state.isEditMode
      ? `Edit IRT - ${this.props.project?.project_summary?.project_summary_title}`
      : `Final IRT - ${this.props.project?.project_summary?.project_summary_title}`;

    const Forms = StepForms(this.props, this.state, this.next, this.prev);

    return (
      this.state.isLoaded && (
        <>
          {!this.state.activeTab && (
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
            <Steps current={this.state.current}>
              {Forms.map((step) => (
                <Steps.Step key={step.title} title={step.title} />
              ))}
            </Steps>
            {!this.state.activeTab && <Divider />}
            <br />
            <br />

            <div>{Forms[this.state.current].content}</div>

            {Forms[this.state.current].buttons}
          </Row>
        </>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  informationRequirementsTable: getInformationRequirementsTable(state),
  project: getProject(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearInformationRequirementsTable,
      fetchProjectById,
    },
    dispatch
  );

InformationRequirementsTablePage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(InformationRequirementsTablePage);
