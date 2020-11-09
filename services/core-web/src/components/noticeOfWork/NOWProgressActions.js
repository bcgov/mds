/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import { getNoticeOfWorkApplicationProgressStatusCodeOptionsHash } from "@common/selectors/staticContentSelectors";

/**
 * @constant NOWProgressActions conditionally renders NoW progress actions for each tab
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  history: PropTypes.shape({ location: PropTypes.objectOf(PropTypes.any) }).isRequired,
  tab: PropTypes.string.isRequired,
};

const defaultProps = {};

export class NOWProgressActions extends Component {
  render() {
    return (
      <div className="inline-flex">
        <Button type="primary">Start {this.props.progressStatusHash[tab]}</Button>
        <Button type="primary"> Complete {this.props.progressStatusHash[tab]}</Button>
        <Button type="primary"> Manage Delay </Button>
        <Button type="primary"> View Reason for Delay </Button>
      </div>
    );
  }
}

NOWProgressActions.propTypes = propTypes;
NOWProgressActions.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  progressStatusHash: getNoticeOfWorkApplicationProgressStatusCodeOptionsHash(state),
});

export default connect(mapStateToProps)(NOWProgressActions);
