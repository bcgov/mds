/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";

/**
 * @constant NOWProgressActions conditionally renders NoW actions based on various conditions (ie, Rejected, Permit issued, client delay, stages not started, etc)
 * persists permissions using authWrapper - These actions are not visible to admin if disabled.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  history: PropTypes.shape({ location: PropTypes.objectOf(PropTypes.any) }).isRequired,
};

const defaultProps = {};

export class NOWProgressActions extends Component {
  render() {
    return <Button> Start Review </Button>;
  }
}

NOWProgressActions.propTypes = propTypes;
NOWProgressActions.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
});

export default connect(mapStateToProps)(NOWProgressActions);
