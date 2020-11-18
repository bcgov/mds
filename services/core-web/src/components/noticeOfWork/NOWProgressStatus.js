import React from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { formatDate } from "@common/utils/helpers";
import { Badge } from "antd";
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
import { COLOR } from "@/constants/styles";

/**
 * @constant NOWProgressStatus conditionally show a status indicator of the various stages on a NoW record based off certain conditions (ie, Rejected, Permit issued, client delay, stages completed, etc)
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  tab: PropTypes.string.isRequired,
  top: PropTypes.string,
  progressStatusHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  top: "-85px",
};

export const NOWProgressStatus = (props) => {
  return (
    <div
      className="status-content"
      style={{
        top: props.top,
      }}
    >
      {isEmpty(props.progress[props.tab]) && (
        <p className="small-p">
          {props.progressStatusHash[props.tab]} Status:
          <Badge color={COLOR.mediumGrey} className="padding-small--left" />
          Not Started
        </p>
      )}
      {!isEmpty(props.progress[props.tab]) && !props.progress[props.tab].end_date && (
        <>
          <p className="small-p">
            {props.progressStatusHash[props.tab]} Status:
            <Badge color={COLOR.blue} className="padding-small--left" />
            In Progress
          </p>
          <p className="small-p">
            In {props.progressStatusHash[props.tab]} Since:
            {formatDate(props.progress[props.tab].start_date)}
          </p>
        </>
      )}
      {!isEmpty(props.progress[props.tab]) && props.progress[props.tab].end_date && (
        <>
          <p className="small-p">
            {props.progressStatusHash[props.tab]} Status:
            <Badge color={COLOR.successGreen} className="padding-small--left" />
            Complete
          </p>
          <p className="small-p">
            In {props.progressStatusHash[props.tab]} Since:
            {formatDate(props.progress[props.tab].start_date)}
          </p>
        </>
      )}
      {props.tab === "REV" && (
        <>
          {props.noticeOfWork.last_updated_date && (
            <p className="small-p">
              Last Updated: {formatDate(props.noticeOfWork.last_updated_date)}
            </p>
          )}
          {props.noticeOfWork.last_updated_by && (
            <p className="small-p">Updated By: {props.noticeOfWork.last_updated_by}</p>
          )}
        </>
      )}
    </div>
  );
};

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
