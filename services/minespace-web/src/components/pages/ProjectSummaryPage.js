/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { getFormValues } from "redux-form";
import { Row, Col, Typography, Tabs, Divider } from "antd";
import { CaretLeftOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
} from "@common/selectors/projectSummarySelectors";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryAuthorizationTypesArray,
} from "@common/selectors/staticContentSelectors";
import {
  createProjectSummary,
  fetchProjectSummaryById,
  updateProjectSummary,
} from "@common/actionCreators/projectSummaryActionCreator";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { formatUrlToUpperCaseString } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import { EDIT_PROJECT_SUMMARY, MINE_DASHBOARD, ADD_PROJECT_SUMMARY } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";

const propTypes = {
  formValues: PropTypes.shape({
    project_summary_date: PropTypes.string,
    project_summary_description: PropTypes.string,
    documents: PropTypes.arrayOf(PropTypes.object),
  }),
  projectSummary: CustomPropTypes.projectSummary,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const defaultProps = {
  projectSummary: {},
  formValues: {},
};

const tabs = [
  "basic-information",
  "project-contacts",
  "project-dates",
  "authorizations-involved",
  "document-upload",
];
export class ProjectSummaryPage extends Component {
  state = {
    isLoaded: false,
    isEditMode: false,
    activeTab: tabs[0],
  };

  componentDidMount() {
    this.handleFetchData();
  }

  handleFetchData = () => {
    const { mineGuid, projectSummaryGuid, tab } = this.props.match?.params;
    if (mineGuid && projectSummaryGuid) {
      return this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid).then(() => {
        this.setState({ isLoaded: true, isEditMode: true, activeTab: tab });
      });
    }
    return this.props.fetchMineRecordById(mineGuid).then(() => {
      this.setState({ isLoaded: true, activeTab: tab });
    });
  };

  handleSaveDraft = (e, values) => {
    e.preventDefault();
    const payload = { status_code: "D", ...values };
    if (!this.state.isEditMode) {
      return this.handleCreateProjectSummary(payload);
    }
    return this.handleUpdateProjectSummary(payload);
  };

  handleSubmit = (values) => {
    const payload = { status_code: "O", ...values };
    if (!this.state.isEditMode) {
      return this.handleCreateProjectSummary(payload);
    }
    return this.handleUpdateProjectSummary(payload);
  };

  handleTransformPayload = (values) => {
    const authorizations = [];
    Object.keys(values).map((key) => {
      if (this.props.projectSummaryAuthorizationTypesArray.includes(key)) {
        authorizations.push({
          project_summary_authorization_type: key,
          existing_permits_authorizations: values[key].existing_permits_authorizations?.split(","),
          ...values[key],
        });
        delete values[key];
      }
    });

    return { authorizations, ...values };
  };

  handleCreateProjectSummary(values) {
    return this.props
      .createProjectSummary(
        {
          mineGuid: this.props.match.params?.mineGuid,
        },
        this.handleTransformPayload(values)
      )
      .then(({ data: { mine_guid, project_summary_guid } }) => {
        this.props.history.push(EDIT_PROJECT_SUMMARY.dynamicRoute(mine_guid, project_summary_guid));
      });
  }

  handleTabChange = (activeTab) => {
    const url = this.state.isEditMode
      ? EDIT_PROJECT_SUMMARY.dynamicRoute(
          this.props.match.params?.mineGuid,
          this.props.match.params?.projectSummaryGuid,
          activeTab
        )
      : ADD_PROJECT_SUMMARY.dynamicRoute(this.props.match.params?.mineGuid, activeTab);
    this.setState({ activeTab });
    this.props.history.push(url);
  };

  handleUpdateProjectSummary(values) {
    const { mine_guid: mineGuid, project_summary_guid: projectSummaryGuid } = values;
    return this.props
      .updateProjectSummary(
        {
          mineGuid,
          projectSummaryGuid,
        },
        this.handleTransformPayload(values)
      )
      .then(() => {
        this.handleFetchData();
      });
  }

  render() {
    const { mineGuid } = this.props.match?.params;
    const mineName = this.state.isEditMode
      ? this.props.formattedProjectSummary?.summary?.mine_name || ""
      : this.props.mines[mineGuid]?.mine_name || "";
    const title = this.state.isEditMode
      ? `Edit project description - ${this.props.projectSummary?.project_summary_title}`
      : `New project description for ${mineName}`;
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
                Back to: {mineName} Applications page
              </Link>
            </Col>
          </Row>
          <Divider />
          <Tabs
            tabPosition="left"
            activeKey={this.state.activeTab}
            defaultActiveKey={tabs[0]}
            onChange={this.handleTabChange}
            className="vertical-tabs"
          >
            {tabs.map((tab) => (
              <Tabs.TabPane
                tab={formatUrlToUpperCaseString(tab)}
                key={tab}
                className="vertical-tabs--tabpane"
              >
                <ProjectSummaryForm
                  initialValues={
                    this.state.isEditMode
                      ? this.props.formattedProjectSummary.summary
                      : {
                          contacts: [],
                        }
                  }
                  mineGuid={mineGuid}
                  isEditMode={this.state.isEditMode}
                  onSubmit={this.handleSubmit}
                  handleSaveDraft={this.handleSaveDraft}
                  projectSummaryDocumentTypesHash={this.props.projectSummaryDocumentTypesHash}
                  handleTabChange={this.handleTabChange}
                />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state) || {},
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProjectSummary,
      fetchProjectSummaryById,
      updateProjectSummary,
      fetchMineRecordById,
    },
    dispatch
  );

ProjectSummaryPage.propTypes = propTypes;
ProjectSummaryPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryPage);
