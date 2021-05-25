import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty, isEqual } from "lodash";
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
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired),
    PropTypes.element.isRequired,
  ]).isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string),
  tab: PropTypes.string,
  allowAfterProcess: PropTypes.bool,
};

const defaultProps = {
  tab: null,
  applicationDelay: {},
  allowAfterProcess: false,
};

export class NOWActionWrapper extends Component {
  state = { disableTab: false };

  componentDidMount() {
    const tabShouldIncludeProgress = APPLICATION_PROGRESS_TRACKING[
      this.props.noticeOfWork.application_type_code
    ].includes(this.props.tab);
    if (tabShouldIncludeProgress) {
      this.handleDisableTab(this.props.tab, this.props.progress);
    } else {
      this.setState({ disableTab: false });
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

    const tabShouldIncludeProgress = APPLICATION_PROGRESS_TRACKING[
      this.props.noticeOfWork.application_type_code
    ].includes(nextProps.tab);

    if ((tabChanged || progressNoWExists || progressChanged) && tabShouldIncludeProgress) {
      this.handleDisableTab(nextProps.tab, nextProps.progress);
    }
  };

  handleDisableTab = (tab, progress) => {
    if (tab) {
      if (!isEmpty(progress[tab]) && !progress[tab].end_date) {
        this.setState({ disableTab: false });
      } else if (isEmpty(progress[tab])) {
        this.setState({ disableTab: true });
      } else if (!isEmpty(progress[tab]) && progress[tab].end_date) {
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
      this.props.noticeOfWork.now_application_status_code === "REJ";
    const disabled = isApplicationDelayed || isApplicationComplete || this.state.disableTab;
    return !disabled || this.props.allowAfterProcess ? (
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

export default connect(mapStateToProps)(NOWActionWrapper);
