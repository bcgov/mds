import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { flattenObject, formatUrlToUpperCaseString } from "@common/utils/helpers";
import { Link, Prompt } from "react-router-dom";
import { Row, Col, Typography, Tabs, Divider, Descriptions, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import { getEMLIContactsByRegion } from "@common/selectors/minespaceSelector";
import {
  getProjectSummary,
  getFormattedProjectSummary,
  getProject,
} from "@common/selectors/projectSelectors";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryAuthorizationTypesArray,
  getEMLIContactTypesHash,
} from "@common/selectors/staticContentSelectors";
import {
  createProjectSummary,
  fetchProjectSummaryById,
  updateProjectSummary,
  fetchProjectById,
} from "@common/actionCreators/projectActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { clearProjectSummary, clearProject } from "@common/actions/projectActions";
import Loading from "@/components/common/Loading";
import { EDIT_PROJECT_SUMMARY, MINE_DASHBOARD, ADD_PROJECT_SUMMARY } from "@/constants/routes";
import * as Strings from "@/constants/strings";
import { formatDate } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import ProjectStagesTable from "../../dashboard/mine/projects/ProjectStagesTable";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  projectSummary: CustomPropTypes.projectSummary,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  clearProjectSummary: PropTypes.func.isRequired,
  clearProject: PropTypes.func.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValueSelector: PropTypes.func.isRequired,
  projectSummaryAuthorizationTypesArray: PropTypes.arrayOf(PropTypes.any).isRequired,
  formattedProjectSummary: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  EMLIcontactInfo: PropTypes.arrayOf(CustomPropTypes.EMLIContactInfo).isRequired,
};

const defaultProps = {
  project: {},
};

const tabs = ["overview", "irt", "toc", "application"];

export class ProjectPage extends Component {
  state = {
    isLoaded: true,
    activeTab: tabs[0],
  };

  componentDidMount() {
    this.handleFetchData();
  }

  componentWillUnmount() {
    this.props.clearProject();
  }

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;
    if (projectGuid) {
      return this.props.fetchProjectById(projectGuid).then(() => {
        this.setState({ isLoaded: true, activeTab: "overview" });
      });
    }
  };

  // handleTransformPayload = (values) => {
  //   let payloadValues = {};
  //   const updatedAuthorizations = [];
  //   // eslint-disable-next-line array-callback-return
  //   Object.keys(values).map((key) => {
  //     // Pull out form properties from request object that match known authorization types
  //     if (values[key] && this.props.projectSummaryAuthorizationTypesArray.includes(key)) {
  //       const project_summary_guid = values?.project_summary_guid;
  //       const authorization = values?.authorizations?.find(
  //         (auth) => auth?.project_summary_authorization_type === key
  //       );
  //       updatedAuthorizations.push({
  //         ...values[key],
  //         // Conditionally add project_summary_guid and project_summary_authorization_guid properties if this a pre-existing authorization
  //         // ... otherwise treat it as a new one which won't have those two properties yet.
  //         ...(project_summary_guid && { project_summary_guid }),
  //         ...(authorization && {
  //           project_summary_authorization_guid: authorization?.project_summary_authorization_guid,
  //         }),
  //         project_summary_authorization_type: key,
  //         project_summary_permit_type:
  //           key === "OTHER" ? ["OTHER"] : values[key]?.project_summary_permit_type,
  //         existing_permits_authorizations:
  //           values[key]?.existing_permits_authorizations?.split(",") || [],
  //       });
  //       // eslint-disable-next-line no-param-reassign
  //       delete values[key];
  //     }
  //   });
  //   payloadValues = {
  //     ...values,
  //     authorizations: updatedAuthorizations,
  //   };
  //   // eslint-disable-next-line no-param-reassign
  //   delete payloadValues.authorizationOptions;
  //   return payloadValues;
  // };

  handleTabChange = (activeTab) => {
    const url = this.state.isEditMode
      ? EDIT_PROJECT_SUMMARY.dynamicRoute(
          this.props.match.params?.projectGuid,
          this.props.match.params?.projectSummaryGuid,
          activeTab
        )
      : ADD_PROJECT_SUMMARY.dynamicRoute(this.props.match.params?.mineGuid, activeTab);
    this.setState({ activeTab });
    this.props.history.push(url);
  };

  render() {
    // const disabledTabs = errors.length > 0;
    const mineGuid = this.state.isEditMode
      ? this.props.formattedProjectSummary?.mine_guid
      : this.props.match.params.mineGuid;
    const mineName = this.state.isEditMode
      ? this.props.formattedProjectSummary?.mine_name || ""
      : this.props.mines[mineGuid]?.mine_name || "";
    const title = this.props.project?.project_title;
    console.log("PROJECT SUMMARY: ", this.props.projectSummary);
    const {
      project_summary_description,
      expected_draft_irt_submission_date,
      expected_permit_application_date,
      expected_permit_receipt_date,
      expected_project_start_date,
    } = this.props.projectSummary;
    const projectStages = [
      {
        title: "Project description",
        key: this.props.projectSummary.project_summary_id,
        status: this.props.projectSummary.status_code,
        payload: this.props.projectSummary,
      },
    ];

    return (
      (this.state.isLoaded && (
        <>
          <Row>
            <Col span={24}>
              <Typography.Title>{title}</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to={MINE_DASHBOARD.dynamicRoute(mineGuid, "applications")}>
                <ArrowLeftOutlined className="padding-sm--right" />
                Back to: {mineName} Mine Projects
              </Link>
            </Col>
          </Row>
          <Divider />
          <Row gutter={[0, 16]}>
            <Col lg={{ span: 14 }} xl={{ span: 16 }}>
              <Typography.Title level={4}>Overview</Typography.Title>
              <Typography.Text strong>PROJECT DESCRIPTION</Typography.Text>
              <Typography.Paragraph>{project_summary_description}</Typography.Paragraph>
              <Typography.Text strong>KEY DATES</Typography.Text>
              <Row>
                <Col lg={12}>
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item span={12} label="Estimated IRT Submission">
                      {formatDate(expected_draft_irt_submission_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                    <Descriptions.Item
                      span={12}
                      label="Desired date to receive permit/amendment(s)"
                    >
                      {formatDate(expected_permit_receipt_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col lg={12}>
                  <Descriptions column={2} layout="vertical">
                    <Descriptions.Item span={12} label="Estimated Permit Application Submission">
                      {formatDate(expected_permit_application_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                    <Descriptions.Item span={12} label="Anticipated work start">
                      {formatDate(expected_project_start_date) || Strings.UNKNOWN}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
              <Typography.Title level={4}>Project Stages</Typography.Title>
              <ProjectStagesTable projectStages={projectStages} />
              <Typography.Title level={4}>Project Documents</Typography.Title>
            </Col>
            <Col lg={{ span: 10 }} xl={{ span: 8 }}>
              <Card title="Project Contacts">
                {/* {this.props.EMLIcontactInfo.map((contact) => (
                  <MinistryContactItem contact={contact} key={contact.id} />
                ))} */}
              </Card>
              <Card title="Ministry Contacts">
                {this.props.EMLIcontactInfo.map((contact) => (
                  <MinistryContactItem contact={contact} key={contact.id} />
                ))}
              </Card>
            </Col>
          </Row>
        </>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  project: getProject(state),
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
  EMLIcontactInfo: getEMLIContactsByRegion(state),
  EMLIContactTypesHash: getEMLIContactTypesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectSummaryById,
      updateProjectSummary,
      fetchMineRecordById,
      clearProjectSummary,
      fetchProjectById,
    },
    dispatch
  );

ProjectPage.propTypes = propTypes;
ProjectPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage);
