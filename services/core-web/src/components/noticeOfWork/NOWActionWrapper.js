import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty, isEqual } from "lodash";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  getNoticeOfWork,
  getApplicationDelay,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";
import { APPLICATION_PROGRESS_TRACKING } from "@/constants/NOWConditions";

/**
 * @constant NOWActionWrapper conditionally renders NoW actions based on various conditions (ie, Rejected, Permit issued, client delay, stages not started, etc)
 * persists permissions using authWrapper - These actions are not visible to admin if disabled.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired),
    PropTypes.element.isRequired,
  ]).isRequired,
  progress: PropTypes.objectOf(PropTypes.string),
  applicationDelay: PropTypes.objectOf(PropTypes.string),
  tab: PropTypes.string,
  allowAfterProcess: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  isDisabledReviewButtons: PropTypes.bool,
};

const defaultProps = {
  tab: null,
  applicationDelay: {},
  allowAfterProcess: false,
  noticeOfWork: {},
  progress: {},
  isDisabledReviewButtons: false,
};

export class NOWActionWrapper extends Component {
  state = { disableTab: false, isAdminDashboard: false };

  componentDidMount() {
    // allow all actions if component is being used on the Admin Dashboard (ie Standard PErmit Condition Management)
    const isAdminDashboard = this.props.location.pathname.includes(
      "admin/permit-condition-management"
    );
    if (isAdminDashboard) {
      this.setState({ disableTab: false, isAdminDashboard });
    } else {
      const tabShouldIncludeProgress = APPLICATION_PROGRESS_TRACKING[
        this.props.noticeOfWork.application_type_code
      ].includes(this.props.tab);
      if (tabShouldIncludeProgress) {
        this.handleDisableTab(
          this.props.tab,
          this.props.progress,
          this.props.isDisabledReviewButton
        );
      } else {
        this.setState({ disableTab: false });
      }
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const tabChanged = this.props.tab !== nextProps.tab;
    const progressNoWExists =
      isEmpty(this.props.progress[this.props.tab]) && !isEmpty(nextProps.progress[this.props.tab]);
    const progressChanged = !isEqual(
      nextProps.progress[this.props.tab],
      this.props.progress[this.props.tab]
    );
    const isAdminDashboard = nextProps.location.pathname.includes(
      "admin/permit-condition-management"
    );
    if (!isAdminDashboard) {
      const tabShouldIncludeProgress = APPLICATION_PROGRESS_TRACKING[
        this.props.noticeOfWork.application_type_code
      ].includes(nextProps.tab);

      if ((tabChanged || progressNoWExists || progressChanged) && tabShouldIncludeProgress) {
        this.handleDisableTab(nextProps.tab, nextProps.progress, nextProps.isDisabledReviewButton);
      }
    }
  };

  handleDisableTab = (tab, progress, isDisabledReviewButton) => {
    if (tab) {
      //application_progress_status_code does not have end_date. Status:In Progress
      if (!isEmpty(progress[tab]) && !progress[tab].end_date) {
        this.setState({ disableTab: false });
      }
      //application_progress_status_code does not exist. Status:Not started
      else if (!isDisabledReviewButton && isEmpty(progress[tab])) {
        this.setState({ disableTab: true });
      }
      //application_progress_status_code has end date. Status: Complete
      else if (!isEmpty(progress[tab]) && progress[tab].end_date) {
        this.setState({ disableTab: true });
      }
    } else {
      this.setState({ disableTab: false });
    }
  };

  render() {
    const isApplicationDelayed = !isEmpty(this.props.applicationDelay);
    const isApplicationComplete =
      this.props.noticeOfWork.now_application_status_code === "AIA" ||
      this.props.noticeOfWork.now_application_status_code === "WDN" ||
      this.props.noticeOfWork.now_application_status_code === "REJ" ||
      this.props.noticeOfWork.now_application_status_code === "NPR";
    const disabled = isApplicationDelayed || isApplicationComplete || this.state.disableTab;
    return !disabled || this.props.allowAfterProcess || this.state.isAdminDashboard ? (
      <AuthorizationWrapper {...this.props}>
        {React.createElement("span", null, this.props.children)}
      </AuthorizationWrapper>
    ) : (
      <div />
    );
  }
}

NOWActionWrapper.propTypes = propTypes;
NOWActionWrapper.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  progress: getNOWProgress(state),
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplicationDelay(state),
});

export default withRouter(connect(mapStateToProps)(NOWActionWrapper));
