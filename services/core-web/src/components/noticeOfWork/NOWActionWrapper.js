/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { getNoticeOfWork, getApplictionDelay } from "@common/selectors/noticeOfWorkSelectors";

/**
 * @constant NOWActionWrapper conditionally renders NoW actions based on various conditions (ie, Rejected, Permit issued, client delay, stages not started, etc)
 * persists permissions using authWrapper - These actions are not visible to admin if disabled.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  history: PropTypes.shape({ location: PropTypes.objectOf(PropTypes.any) }).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired),
    PropTypes.element.isRequired,
  ]).isRequired,
};

const defaultProps = {};
// eslint-disable-next-line react/prefer-stateless-function
export class NOWActionWrapper extends Component {
  // state = { currentTab: "" };

  // componentDidMount() {
  //   // use this logic to disable buttons on a specific section based on progress not started or completed
  //   const split = this.props.history.location.pathname.split("/");
  //   const currentTab = split.pop();
  //   this.setState({ currentTab });
  // }

  render() {
    const isApplicationDelayed =
      this.props.applicationDelay.length > 0 && this.props.applicationDelay[0].end_date === null;
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
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplictionDelay(state),
});

export default withRouter(connect(mapStateToProps)(NOWActionWrapper));
