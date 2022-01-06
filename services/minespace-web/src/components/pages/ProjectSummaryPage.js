/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { getFormValues } from "redux-form";
import { Row, Col, Typography, Tabs, Divider } from "antd";
import { CaretLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getProjectSummary } from "@common/selectors/projectSummarySelectors";
import { getProjectSummaryDocumentTypesHash } from "@common/selectors/staticContentSelectors";
import {
  createProjectSummary,
  fetchProjectSummaryById,
  updateProjectSummary,
} from "@common/actionCreators/projectSummaryActionCreator";
import { formatTitleString } from "@common/utils/helpers";
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

const initialTab = "basic-information";
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
    const { mineGuid, projectSummaryGuid, tab } = this.props.match?.params;
    if (mineGuid && projectSummaryGuid) {
      return this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid).then(() => {
        this.setState({ isLoaded: true, isEditMode: true, activeTab: tab });
      });
    }
    return this.setState({ isLoaded: true, activeTab: tab });
  }

  handleSubmit = (values) => {
    console.log(values);
    if (!this.state.isEditMode) {
      return this.handleCreateProjectSummary(values);
    }
    return this.handleUpdateProjectSummary(values);
  };

  handleCreateProjectSummary(values) {
    return this.props
      .createProjectSummary(
        {
          mineGuid: this.props.match.params?.mineGuid,
        },
        values
      )
      .then(({ data: { mine_guid, project_summary_guid } }) => {
        this.props.history.push(EDIT_PROJECT_SUMMARY.dynamicRoute(mine_guid, project_summary_guid));
        window.location.reload();
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
    console.log(values);
    const payload = {
      ...values,
    };
    const { mine_guid: mineGuid, project_summary_guid: projectSummaryGuid } = values;
    return this.props
      .updateProjectSummary(
        {
          mineGuid,
          projectSummaryGuid,
        },
        payload
      )
      .then(({ data: { mine_guid, project_summary_guid } }) => {
        this.props.fetchProjectSummaryById(mine_guid, project_summary_guid);
      });
  }

  render() {
    const title = this.state.isEditMode
      ? `Edit Project Description #${this.props.projectSummary?.project_summary_id}`
      : "Create new Project Description";
    const { mineGuid } = this.props.match?.params;
    return (
      (this.state.isLoaded && (
        <>
          <Row>
            <Col span={24}>
              <Typography.Title>
                <Link to={MINE_DASHBOARD.dynamicRoute(mineGuid, "applications")}>
                  <CaretLeftOutlined />
                </Link>
                {title}
              </Typography.Title>
            </Col>
          </Row>
          <Divider />
          <Tabs
            tabPosition="left"
            activeKey={this.state.activeTab}
            defaultActiveKey={tabs[0]}
            onChange={this.handleTabChange}
          >
            {tabs.map((tab) => (
              <Tabs.TabPane tab={formatTitleString(tab)} key={tab}>
                <ProjectSummaryForm
                  initialValues={
                    this.state.isEditMode
                      ? this.props.projectSummary
                      : {
                          status_code: "D",
                        }
                  }
                  mineGuid={mineGuid}
                  isEditMode={this.state.isEditMode}
                  onSubmit={this.handleSubmit}
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
  formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state) || {},
  projectSummary: getProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProjectSummary,
      fetchProjectSummaryById,
      updateProjectSummary,
    },
    dispatch
  );

ProjectSummaryPage.propTypes = propTypes;
ProjectSummaryPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryPage);
