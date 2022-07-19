import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link, withRouter } from "react-router-dom";
import { Row, Col, Button, Typography, Steps } from "antd";
import { ArrowLeftOutlined, DownloadOutlined, HourglassOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import { ENVIRONMENT } from "@common/constants/environment";
import * as API from "@common/constants/API";

import { getProject, getRequirements } from "@common/selectors/projectSelectors";
import { clearInformationRequirementsTable } from "@common/actions/projectActions";
import {
  fetchProjectById,
  fetchRequirements,
  updateInformationRequirementsTable,
} from "@common/actionCreators/projectActionCreator";
import InformationRequirementsTableCallout from "@/components/Forms/projects/informationRequirementsTable/InformationRequirementsTableCallout";
import { getInformationRequirementsTableDocumentTypesHash } from "@common/selectors/staticContentSelectors";
import IRTDownloadTemplate from "@/components/Forms/projects/informationRequirementsTable/IRTDownloadTemplate";
import IRTFileImport from "@/components/Forms/projects/informationRequirementsTable/IRTFileImport";
import { InformationRequirementsTableForm } from "@/components/Forms/projects/informationRequirementsTable/InformationRequirementsTableForm";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  updateInformationRequirementsTable: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  requirements: PropTypes.arrayOf(CustomPropTypes.requirements).isRequired,
  fetchRequirements: PropTypes.func.isRequired,
  clearInformationRequirementsTable: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  informationRequirementsTableDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
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
  "introduction-and-project-overview",
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
  importIsSuccessful,
  downloadIRTTemplate
) => [
  {
    title: "Download Template",
    content: (
      <IRTDownloadTemplate
        downloadIRTTemplate={() =>
          downloadIRTTemplate(
            ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
          )
        }
      />
    ),
    buttons: [
      null,
      <Button id="step1-next" type="primary" onClick={() => next()}>
        Continue to Import
      </Button>,
    ],
  },
  {
    title: "Import File",
    content: (
      <IRTFileImport
        projectGuid={props.project.project_guid}
        informationRequirementsTableDocumentTypesHash={
          props.informationRequirementsTableDocumentTypesHash
        }
        importIsSuccessful={importIsSuccessful}
        downloadIRTTemplate={downloadIRTTemplate}
      />
    ),
    buttons: [
      <>
        {props.project.information_requirements_table?.status_code !== "PRG" ? (
          <>
            <Button
              id="step2-next"
              type="primary"
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
                !state.uploadedSuccessfully &&
                !props.project?.information_requirements_table?.irt_guid
              }
            >
              Continue to Review
            </Button>
          </>
        ) : (
          <>
            <Button
              id="step-back"
              type="tertiary"
              className="full-mobile"
              style={{ marginRight: "12px" }}
              onClick={() => prev()}
              disabled={state.submitting}
            >
              Back
            </Button>
            <Button
              id="step2-next"
              type="primary"
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
                !state.uploadedSuccessfully &&
                !props.project?.information_requirements_table?.irt_guid
              }
            >
              Continue to Review
            </Button>
          </>
        )}
      </>,
    ],
  },
  {
    title: "Review & Submit",
    content: (
      <>
        {props.project?.information_requirements_table?.status_code === "PRG" ? (
          <Typography.Title level={4}>Review IRT before submission</Typography.Title>
        ) : null}
        <InformationRequirementsTableForm
          project={props.project}
          informationRequirementsTable={props.project?.information_requirements_table}
          requirements={props.requirements}
          tab={props.match?.params?.tab}
          sideMenuOptions={tabs}
          isEditMode={state.isEditMode}
          handleTabChange={handleTabChange}
        />
      </>
    ),
    buttons: [
      <>
        {props.project.information_requirements_table?.status_code === "PRG" ? (
          <>
            <Button
              id="step-back"
              type="tertiary"
              className="full-mobile"
              style={{ marginRight: "24px" }}
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
            </Button>
            ,
            <Link
              to={routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                props.project?.project_guid,
                props.project?.information_requirements_table?.irt_guid
              )}
            >
              <Button
                id="submit_irt"
                type="primary"
                htmlType="submit"
                onClick={() => {
                  handleIRTUpdate({ status_code: "REC" }, "IRT submitted ");
                }}
                disabled={state.submitting}
              >
                Submit IRT
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Button
              type="secondary"
              htmlType="submit"
              style={{ marginRight: "24px" }}
              onClick={() => {
                props.history.push({
                  pathname: `${routes.RESUBMIT_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                    props.project?.project_guid,
                    props.project?.information_requirements_table?.irt_guid
                  )}`,
                  state: { current: 1 },
                });
              }}
              disabled={state.submitting}
            >
              Resubmit IRT
            </Button>

            <Button
              type="ghost"
              style={{ border: "none", marginRight: "12px" }}
              className="full-mobile"
              onClick={() =>
                downloadIRTTemplate(
                  ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
                )
              }
            >
              <DownloadOutlined />
              Download IRT template
            </Button>

            <Button type="ghost" style={{ border: "none" }} className="full-mobile">
              <HourglassOutlined />
              File History
            </Button>
          </>
        )}
      </>,
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
    this.handleFetchData()
      .then(() => {
        this.setState((prevState) => ({
          current: this.props.location?.state?.current || prevState.current,
        }));
      })
      .then(() => {
        if (this.props.project.information_requirements_table?.status_code === "PRG") {
          this.setState((prevState) => ({
            isEditMode: !prevState.isEditMode,
          }));
        }
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
    this.setState((state) => ({
      uploadedSuccessfully: !state.uploadedSuccessfully,
      isEditMode: !state.isEditMode,
    }));
    this.handleFetchData();
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

  downloadIRTTemplate = (url) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  render() {
    const title =
      this.props.project.information_requirements_table?.status_code !== "PRG"
        ? this.props.project?.project_title
        : `Major Mine Submission - ${this.props.project?.project_title}`;

    const Forms = StepForms(
      this.props,
      this.state,
      this.next,
      this.prev,
      this.handleTabChange,
      this.handleIRTUpdate,
      this.importIsSuccessful,
      this.downloadIRTTemplate
    );

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
                    to={routes.EDIT_PROJECT.dynamicRoute(
                      this.props.project.project_summary.project_guid
                    )}
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
            <Col span={12}>
              <Typography.Title level={2}>Information Requirements Table</Typography.Title>
            </Col>
            <Col span={12}>
              <div style={{ display: "inline", float: "right" }}>
                <p>{Forms[this.props.location.state?.current || this.state.current].buttons}</p>
              </div>
            </Col>
          </Row>
          <Row>
            <Steps current={this.props.location.state?.current || this.state.current}>
              {Forms.map((step) => (
                <Steps.Step key={step.title} title={step.title} />
              ))}
            </Steps>
            <br />
            <br />

            <div>
              <InformationRequirementsTableCallout
                informationRequirementsTableStatus={
                  this.props.project?.information_requirements_table?.status_code || "PRG"
                }
              />
            </div>

            <Col span={24}>
              <div>{Forms[this.props.location.state?.current || this.state.current].content}</div>
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
  informationRequirementsTableDocumentTypesHash: getInformationRequirementsTableDocumentTypesHash(
    state
  ),
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
