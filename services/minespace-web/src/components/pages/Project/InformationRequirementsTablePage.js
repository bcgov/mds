import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link, withRouter } from "react-router-dom";
import { Row, Col, Button, Typography, Steps, Popconfirm } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  HourglassOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@common/constants/API";
import { cleanFilePondFile } from "@common/utils/helpers";
import { getProject, getRequirements } from "@mds/common/redux/selectors/projectSelectors";
import { clearInformationRequirementsTable } from "@mds/common/redux/actions/projectActions";
import {
  fetchProjectById,
  fetchRequirements,
  updateInformationRequirementsTable,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getInformationRequirementsTableDocumentTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import InformationRequirementsTableCallout from "@/components/Forms/projects/informationRequirementsTable/InformationRequirementsTableCallout";
import IRTDownloadTemplate from "@/components/Forms/projects/informationRequirementsTable/IRTDownloadTemplate";
import IRTFileImport from "@/components/Forms/projects/informationRequirementsTable/IRTFileImport";
import { InformationRequirementsTableForm } from "@/components/Forms/projects/informationRequirementsTable/InformationRequirementsTableForm";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  updateInformationRequirementsTable: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  requirements: PropTypes.arrayOf(CustomPropTypes.requirements).isRequired,
  fetchRequirements: PropTypes.func.isRequired,
  clearInformationRequirementsTable: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  informationRequirementsTableDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
      tab: PropTypes.string,
      irtGuid: PropTypes.string,
    }),
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      current: PropTypes.number,
    }),
  }).isRequired,
};

const tabs = [
  "introduction-and-project-overview",
  "baseline-information",
  "mine-plan",
  "reclamation-and-closure-plan",
  "modelling-mitigation-and-discharges",
  "environmental-assessment-predictions",
  "environmental-monitoring",
  "health-and-safety",
  "management-plans",
];

const StepForms = (
  props,
  state,
  next,
  prev,
  handleTabChange,
  handleIRTUpdate,
  importIsSuccessful,
  downloadIRTTemplate,
  openViewFileHistoryModal
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
            !state.uploadedSuccessfully && !props.project?.information_requirements_table?.irt_guid
          }
        >
          Continue to Review
        </Button>
      </>,
    ],
  },
  {
    title: "Review & Submit",
    content: (
      <>
        {props.project?.information_requirements_table?.status_code === "DFT" ? (
          <>
            <Typography.Title level={4}>Review IRT before submission</Typography.Title>
            <Typography.Paragraph>
              Review imported data before submission. Check the requirements and comments fields
              that are required for the project.
            </Typography.Paragraph>
          </>
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
        {props.project.information_requirements_table?.status_code === "DFT" ? (
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
            <Link
              to={routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                props.project?.project_guid,
                props.project?.information_requirements_table?.irt_guid
              )}
            >
              <AuthorizationWrapper>
                <Popconfirm
                  placement="topRight"
                  title="Are you sure you want to submit your final IRT, no changes could be made after submitting?"
                  onConfirm={() =>
                    handleIRTUpdate(
                      {
                        status_code: "SUB",
                      },
                      "Successfully submitted final IRT."
                    )
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <Button id="submit_irt" type="primary">
                    Submit IRT
                  </Button>
                </Popconfirm>
              </AuthorizationWrapper>
            </Link>
          </>
        ) : (
          <>
            {props.project.information_requirements_table?.status_code !== "APV" &&
              props.project.information_requirements_table?.status_code !== "UNR" && (
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
              )}
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

            <Button
              type="ghost"
              style={{ border: "none" }}
              className="full-mobile"
              onClick={(event) => openViewFileHistoryModal(event)}
            >
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
    importFailed: false,
    importErrors: null,
    hasBadRequestError: false,
  };

  componentDidMount() {
    this.handleFetchData()
      .then(() => {
        this.setState((prevState) => ({
          current: this.props.location?.state?.current || prevState.current,
        }));
      })
      .then(() => {
        if (this.props.project.information_requirements_table?.status_code === "DFT") {
          this.setState((prevState) => ({
            isEditMode: !prevState.isEditMode,
          }));
        }
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.importFailed !== prevState.importFailed && this.state.importFailed) {
      return this.openIRTImportErrorModal(this.state.importErrors);
    }
    if (
      this.state.uploadedSuccessfully !== prevState.uploadedSuccessfully &&
      this.state.uploadedSuccessfully
    ) {
      return this.openIRTImportSuccessModal();
    }
    return null;
  }

  componentWillUnmount() {
    this.props.clearInformationRequirementsTable();
  }

  marshalImportIRTError = (error) => {
    // Transform single quotes on object properties to double to allow JSON parse
    const formattedError = error.replaceAll(`'`, `"`);
    const regex = /({"row_number": \d+, "section": \d+, "error": "\w+"})/g;
    const errorMatch = formattedError.match(regex);
    if (!errorMatch) {
      return error;
    }
    return errorMatch.map((e) => JSON.parse(e));
  };

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

  next = () => {
    if (this.props.location?.state?.current) {
      this.setState(() => ({ current: this.props.location?.state?.current + 1 }));
      // eslint-disable-next-line no-restricted-globals
      this.props.history.replace(location.state, null);
    } else {
      this.setState((prevState) => ({ current: prevState.current + 1 }));
    }
  };

  prev = () => {
    if (this.props.location?.state?.current) {
      this.setState(() => ({ current: this.props.location?.state?.current - 1 }));
      // eslint-disable-next-line no-restricted-globals
      this.props.history.replace(location.state, null);
    } else {
      this.setState((prevState) => ({ current: prevState.current - 1 }));
    }
  };

  importIsSuccessful = async (success, err) => {
    if (!success) {
      const hasBadRequestError = err?.response?.data?.message.includes("400 Bad Request: [");
      const formattedError = this.marshalImportIRTError(err?.response?.data?.message);
      await this.handleFetchData();
      return this.setState({
        importFailed: true,
        importErrors: formattedError,
        hasBadRequestError,
      });
    }
    await this.handleFetchData();
    this.setState((prevState) => ({
      uploadedSuccessfully: true,
      isEditMode: !prevState.isEditMode,
    }));
    return cleanFilePondFile();
  };

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;

    return this.props
      .fetchProjectById(projectGuid)
      .then(() => this.props.fetchRequirements())
      .then(() =>
        this.setState({
          isLoaded: true,
          uploadedSuccessfully: false,
          importFailed: false,
          importErrors: null,
          hasBadRequestError: false,
        })
      );
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
      })
      .then(() =>
        this.props.history.push({
          pathname: `${routes.INFORMATION_REQUIREMENTS_TABLE_SUCCESS.dynamicRoute(
            projectGuid,
            informationRequirementsTableGuid
          )}`,
          state: { project: this.props.project },
        })
      );
  };

  downloadIRTTemplate = (url) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  openViewFileHistoryModal = () => {
    this.props.openModal({
      props: {
        project: this.props.project,
        title: " View File History",
        documentCategoryOptionsHash: this.props.informationRequirementsTableDocumentTypesHash,
        width: 650,
      },
      content: modalConfig.VIEW_FILE_HISTORY,
    });
  };

  openIRTImportSuccessModal = () => {
    const { project = {} } = this.props;
    const { project_guid: projectGuid } = project;
    const irtGuid = project?.information_requirements_table?.irt_guid;

    return this.props.openModal({
      props: {
        title: (
          <>
            <CheckCircleOutlined style={{ color: "green" }} />
            {"  "}Import Successful
          </>
        ),
        navigateForward: () =>
          this.props.history.push({
            pathname: `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
              projectGuid,
              irtGuid
            )}`,
            state: { current: 2 },
          }),
      },
      content: modalConfig.IMPORT_IRT_SUCCESS,
    });
  };

  openIRTImportErrorModal = (errors = []) => {
    const title = this.state.hasBadRequestError ? (
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

    return this.props.openModal({
      props: {
        title,
        errors,
        isBadRequestError: this.state.hasBadRequestError,
      },
      content: modalConfig.IMPORT_IRT_FAILURE,
    });
  };

  render() {
    const title =
      this.props.project.information_requirements_table?.status_code !== "DFT"
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
      this.downloadIRTTemplate,
      this.openViewFileHistoryModal
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
                <p>{Forms[this.state.current].buttons}</p>
              </div>
            </Col>
          </Row>
          <Row>
            {this.props.project?.information_requirements_table?.status_code !== "APV" && (
              <Steps current={this.state.current}>
                {Forms.map((step) => (
                  <Steps.Step key={step.title} title={step.title} />
                ))}
              </Steps>
            )}
            <br />
            <br />
            <Col span={24}>
              {this.state.current !== 0 && (
                <InformationRequirementsTableCallout
                  informationRequirementsTableStatus={
                    this.props.project?.information_requirements_table?.status_code || "DFT"
                  }
                />
              )}
              <div>{Forms[this.state.current].content}</div>
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
      openModal,
      closeModal,
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
