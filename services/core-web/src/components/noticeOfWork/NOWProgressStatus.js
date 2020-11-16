/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { formatDate, flattenObject } from "@common/utils/helpers";
import { Badge, Descriptions } from "antd";
import CustomPropTypes from "@/customPropTypes";
import {
  getNoticeOfWork,
  getApplicationDelay,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";
import {
  getDelayTypeOptionsHash,
  getNoticeOfWorkApplicationProgressStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";

/**
 * @constant NOWProgressStatus conditionally show a status indicator of the various stages on a NoW record based off certain conditions (ie, Rejected, Permit issued, client delay, stages completed, etc)
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  type: PropTypes.string.isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  tabSection: PropTypes.string,
};

const defaultProps = {};

export class NOWProgressStatus extends Component {
  render() {
    return (
      <div className="right" style={{ position: "relative", top: "-80px", right: "20px" }}>
        {this.props.noticeOfWork.last_updated_date && (
          <p>Last Updated: {formatDate(this.props.noticeOfWork.last_updated_date)}</p>
        )}
        {this.props.noticeOfWork.last_updated_by && (
          <p>Updated By: {this.props.noticeOfWork.last_updated_by}</p>
        )}
      </div>
    );
  }
}

NOWProgressStatus.propTypes = propTypes;
NOWProgressStatus.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  progress: getNOWProgress(state),
  progressStatusHash: getNoticeOfWorkApplicationProgressStatusCodeOptionsHash(state),
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplicationDelay(state),
  delayTypeOptionsHash: getDelayTypeOptionsHash(state),
});

export default connect(mapStateToProps)(NOWProgressStatus);
