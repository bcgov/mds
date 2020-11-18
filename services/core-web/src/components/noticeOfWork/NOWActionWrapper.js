import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  getNoticeOfWork,
  getApplicationDelay,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";

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
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
  tab: PropTypes.string,
};

const defaultProps = {
  tab: null,
};
export class NOWActionWrapper extends Component {
  state = { disableTab: false };

  componentDidMount() {
    this.handleDisableTab(this.props.tab);
  }

  componentWillReceiveProps(nextProps) {
    const tabChanged = this.props.tab !== nextProps.tab;
    if (tabChanged) {
      this.handleDisableTab(nextProps.tab);
    }
  }

  handleDisableTab = (tab) => {
    if (tab) {
      if (!isEmpty(this.props.progress[tab]) && !this.props.progress[tab].end_date) {
        this.setState({ disableTab: false });
      } else if (isEmpty(this.props.progress[tab])) {
        this.setState({ disableTab: true });
      } else if (!isEmpty(this.props.progress[tab]) && this.props.progress[tab].end_date) {
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
    return !disabled ? (
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
