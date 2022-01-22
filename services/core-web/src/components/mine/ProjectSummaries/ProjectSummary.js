import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { submit, getFormValues, reduxForm, formValueSelector } from "redux-form";
import { Divider, Tabs } from "antd";
import PropTypes from "prop-types";
import {
  getProjectSummaryStatusCodesHash,
  getProjectSummaryDocumentTypesHash,
} from "@common/selectors/staticContentSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
} from "@common/selectors/projectSummarySelectors";
import { fetchProjectSummaryById } from "@common/actionCreators/projectSummaryActionCreator";
import * as router from "@/constants/routes";
import * as FORM from "@/constants/forms";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
// import ProjectSummaryPageHeader from "@/components/mine/ProjectSummaries/ProjectSummaryPageHeader";
// import ProjectSummarySideMenu from "@/components/mine/ProjectSummaries/ProjectSummarySideMenu";
import { ProjectSummaryForm } from "@/components/Forms/projectSummaries/ProjectSummaryForm";
import * as Permission from "@/constants/permissions";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  projectSummary: CustomPropTypes.projectSummary,
  projectSummaryStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  getProjectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  projectSummary: {},
};

export class ProjectSummary extends Component {
  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.handleFetchData();
  }

  handleFetchData = () => {
    const { mineGuid, projectSummaryGuid } = this.props.match?.params;
    if (mineGuid && projectSummaryGuid) {
      return this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid).then(() => {
        this.setState({ isLoaded: true });
      });
    }
  };

  handleSubmit = (values) => {
    return true;
  };

  render() {
    return (
      <div className="page">
        {/* <div className="side-menu--fixed">
          <ProjectSummarySideMenu />
        </div> */}
        <ProjectSummaryForm {...this.props} initialValues={this.props.formattedProjectSummary} />
      </div>
    );
  }
}

ProjectSummary.propTypes = propTypes;
ProjectSummary.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    projectSummary: getProjectSummary(state),
    formattedProjectSummary: getFormattedProjectSummary(state),
    formValues: getFormValues(FORM.PROJECT_SUMMARY)(state),
    projectSummaryStatusCodeHash: getProjectSummaryStatusCodesHash(state),
    projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
    initialValues: getFormattedProjectSummary(state),
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectSummaryById,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.PROJECT_SUMMARY,
    enableReinitialize: true,
  })
)(ProjectSummary);
