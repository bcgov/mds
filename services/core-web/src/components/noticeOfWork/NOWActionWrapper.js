/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  getNoticeOfWork,
  getApplictionDelay,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";

/**
 * @constant NOWActionWrapper conditionally renders NoW actions based on various conditions (ie, Rejected, Permit issued, client delay, stages not started, etc)
 * persists permissions using authWrapper - These actions are not visible to admin if disabled.
 */
const TabCodes = {
  application: "REV",
  referral: "REF",
  consultation: "CON",
  "public-comment": "PUB",
  "draft-permit": "DFT",
};

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  history: PropTypes.shape({ location: PropTypes.objectOf(PropTypes.any) }).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired),
    PropTypes.element.isRequired,
  ]).isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {};
export class NOWActionWrapper extends Component {
  state = { currentTab: "" };

  componentDidMount() {
    const split = this.props.history.location.pathname.split("/");
    const currentTab = split.pop();
    this.setState({ currentTab });
  }

  render() {
    // commenting out until this is implemented in the follow up PR
    // const currentTabCode = TabCodes[this.state.currentTab];
    // const tabInProgress =
    //   !isEmpty(this.props.progress[currentTabCode]) &&
    //   !this.props.progress[currentTabCode].end_date;
    const isApplicationDelayed = !isEmpty(this.props.applicationDelay);
    // const disabled = isApplicationDelayed || !tabInProgress;
    const disabled = isApplicationDelayed;
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
  // can disable all actions based off application status === rejected || withdrawn
  // can disable all based if permit is issued
  // can disable all based off client delay
  progress: getNOWProgress(state),
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplictionDelay(state),
});

export default withRouter(connect(mapStateToProps)(NOWActionWrapper));
