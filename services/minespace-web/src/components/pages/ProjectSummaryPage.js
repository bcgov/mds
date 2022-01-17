import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { flattenObject, formatUrlToUpperCaseString } from "@common/utils/helpers";
import { Link, Prompt } from "react-router-dom";
import { submit, formValueSelector, getFormSyncErrors, reset, touch } from "redux-form";
import { Row, Col, Typography, Tabs, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import { EDIT_PROJECT_SUMMARY, MINE_DASHBOARD, ADD_PROJECT_SUMMARY } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/ProjectSummaryForm";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
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
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  formValueSelector: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  getFormSyncErrors: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  touch: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  projectSummaryAuthorizationTypesArray: PropTypes.arrayOf(PropTypes.any).isRequired,
  anyTouched: PropTypes.bool,
  formattedProjectSummary: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
};

const defaultProps = {
  projectSummary: {},
  formErrors: {},
  anyTouched: false,
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

  // eslint-disable-next-line consistent-return
  handleSaveData = (e, values) => {
    e.preventDefault();
    this.props.submit(FORM.ADD_EDIT_PROJECT_SUMMARY);
    this.props.touch(FORM.ADD_EDIT_PROJECT_SUMMARY);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      if (!this.state.isEditMode) {
        return this.handleCreateProjectSummary(values);
      }
      return this.handleUpdateProjectSummary(values);
    }
  };

  handleTransformPayload = (values) => {
    let payloadValues = {};
    const updatedAuthorizations = [];
    // eslint-disable-next-line array-callback-return
    Object.keys(values).map((key) => {
      if (values[key] && this.props.projectSummaryAuthorizationTypesArray.includes(key)) {
        const project_summary_guid = values?.project_summary_guid;
        const authorization = values?.authorizations?.find(
          (auth) => auth?.project_summary_authorization_type === key
        );
        updatedAuthorizations.push({
          ...values[key],
          ...(project_summary_guid && { project_summary_guid }),
          ...(authorization && {
            project_summary_authorization_guid: authorization?.project_summary_authorization_guid,
          }),
          project_summary_authorization_type: key,
          project_summary_permit_type:
            key === "OTHER" ? ["OTHER"] : values[key]?.project_summary_permit_type,
          existing_permits_authorizations:
            values[key]?.existing_permits_authorizations?.split(",") || [],
        });
        // eslint-disable-next-line no-param-reassign
        delete values[key];
      }
    });
    payloadValues = {
      ...values,
      authorizations: updatedAuthorizations,
    };
    // eslint-disable-next-line no-param-reassign
    delete payloadValues.authorizationOptions;
    return payloadValues;
  };

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

  handleCreateProjectSummary(values) {
    return this.props
      .createProjectSummary(
        {
          mineGuid: this.props.match.params?.mineGuid,
        },
        this.handleTransformPayload(values)
      )
      .then(({ data: { mine_guid, project_summary_guid } }) => {
        this.props.history.replace(
          EDIT_PROJECT_SUMMARY.dynamicRoute(mine_guid, project_summary_guid)
        );
      });
  }

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
    const errors = Object.keys(flattenObject(this.props.formErrors));
    const disabledTabs = errors.length > 0;
    const { mineGuid } = this.props.match?.params;
    const mineName = this.state.isEditMode
      ? this.props.formattedProjectSummary?.mine_name || ""
      : this.props.mines[mineGuid]?.mine_name || "";
    const title = this.state.isEditMode
      ? `Edit project description - ${this.props.projectSummary?.project_summary_title}`
      : `New project description for ${mineName}`;
    return (
      (this.state.isLoaded && (
        <>
          <Prompt
            when={this.props.anyTouched}
            message={(location, action) => {
              if (action === "REPLACE") {
                this.props.reset(FORM.ADD_EDIT_PROJECT_SUMMARY);
              }
              return this.props.location.pathname !== location.pathname &&
                !location.pathname.includes("project-description") &&
                this.props.anyTouched
                ? "You have unsaved changes. Are you sure you want to leave without saving?"
                : true;
            }}
          />
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
            onChange={(tab) => this.handleTabChange(tab)}
            className="vertical-tabs"
          >
            {tabs.map((tab) => {
              return (
                <Tabs.TabPane
                  tab={formatUrlToUpperCaseString(tab)}
                  disabled={disabledTabs}
                  key={tab}
                  className="vertical-tabs--tabpane"
                >
                  <ProjectSummaryForm
                    initialValues={this.state.isEditMode ? this.props.formattedProjectSummary : {}}
                    mineGuid={mineGuid}
                    isEditMode={this.state.isEditMode}
                    handleSaveData={this.handleSaveData}
                    projectSummaryDocumentTypesHash={this.props.projectSummaryDocumentTypesHash}
                    handleTabChange={this.handleTabChange}
                  />
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </>
      )) || <Loading />
    );
  }
}

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  anyTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.anyTouched || false,
  fieldsTouched: state.form[FORM.ADD_EDIT_PROJECT_SUMMARY]?.fields || {},
  mines: getMines(state),
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
  contacts: selector(state, "contacts"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProjectSummary,
      fetchProjectSummaryById,
      updateProjectSummary,
      fetchMineRecordById,
      submit,
      reset,
      touch,
    },
    dispatch
  );

ProjectSummaryPage.propTypes = propTypes;
ProjectSummaryPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryPage);
