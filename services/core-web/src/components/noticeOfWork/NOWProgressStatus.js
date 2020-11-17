/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { formatDate, flattenObject, getDurationText } from "@common/utils/helpers";
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
  tab: PropTypes.string.isRequired,
};

const defaultProps = {
  bottom: "90px",
};

export class NOWProgressStatus extends Component {
  render() {
    return (
      <div
        style={{
          position: "relative",
          bottom: this.props.bottom,
          float: "right",
          padding: "10px",
        }}
      >
        {isEmpty(this.props.progress[this.props.tab]) && (
          <p style={{ fontSize: "12px" }}>
            {this.props.progressStatusHash[this.props.tab]} Status:{" "}
            <Badge color="grey" style={{ paddingLeft: "5px" }} />
            Not Started
          </p>
        )}
        {!isEmpty(this.props.progress[this.props.tab]) &&
          !this.props.progress[this.props.tab].end_date && (
            <>
              <p style={{ fontSize: "12px" }}>
                {this.props.progressStatusHash[this.props.tab]} Status:
                <Badge color="blue" style={{ paddingLeft: "5px" }} />
                In Progress
              </p>
              <p style={{ fontSize: "12px" }}>
                In {this.props.progressStatusHash[this.props.tab]} Since:
                {formatDate(this.props.progress[this.props.tab].start_date)}/{" "}
                {/* {getDurationText(
                  this.props.progress[this.props.tab].start_date,
                  new Date().toISOString()
                )} */}
              </p>
            </>
          )}
        {!isEmpty(this.props.progress[this.props.tab]) &&
          this.props.progress[this.props.tab].end_date && (
            <>
              <p style={{ fontSize: "12px" }}>
                {this.props.progressStatusHash[this.props.tab]} Status:
                <Badge color="green" style={{ paddingLeft: "5px" }} />
                Complete
              </p>
              <p style={{ fontSize: "12px" }}>
                In {this.props.progressStatusHash[this.props.tab]} Since:
                {formatDate(this.props.progress[this.props.tab].start_date)}/{" "}
                {/* {getDurationText(
              this.props.progress[this.props.tab].start_date,
              new Date().toISOString()
            )} */}
              </p>
            </>
          )}
        {this.props.tab === "REV" && (
          <>
            {this.props.noticeOfWork.last_updated_date && (
              <p style={{ fontSize: "12px" }}>
                Last Updated: {formatDate(this.props.noticeOfWork.last_updated_date)}
              </p>
            )}
            {this.props.noticeOfWork.last_updated_by && (
              <p style={{ fontSize: "12px" }}>
                Updated By: {this.props.noticeOfWork.last_updated_by}
              </p>
            )}
          </>
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
