import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { submit, formValueSelector, getFormSyncErrors, reset, touch } from "redux-form";
import { Divider, Tabs } from "antd";
import PropTypes from "prop-types";
import { getMineRegionHash } from "@common/selectors/staticContentSelectors";
import { getMineGuid } from "@common/selectors/mineSelectors";
import {
  getProjectSummary,
  getFormattedProjectSummary,
} from "@common/selectors/projectSummarySelectors";
import { fetchProjectSummaryById } from "@common/actionCreators/projectSummaryActionCreator";
import * as router from "@/constants/routes";
import * as FORM from "@/constants/forms";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  projectSummary: CustomPropTypes.projectSummary,
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

  render() {}
}

const selector = formValueSelector(FORM.PROJECT_SUMMAY_FORM);
const mapStateToProps = (state) => ({
  projectSummary: getProjectSummary(state),
  formattedProjectSummary: getFormattedProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
  projectSummaryAuthorizationTypesArray: getProjectSummaryAuthorizationTypesArray(state),
  contacts: selector(state, "contacts"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectSummaryById,
    },
    dispatch
  );

ProjectSummary.propTypes = propTypes;
ProjectSummary.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummary);
