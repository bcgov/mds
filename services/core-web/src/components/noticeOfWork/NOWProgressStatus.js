import React from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { Link } from "react-router-dom";
import { formatDate } from "@common/utils/helpers";
import { Badge } from "antd";
import CustomPropTypes from "@/customPropTypes";
import {
  getNoticeOfWork,
  getApplicationDelay,
  getNOWProgress,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  getDelayTypeOptionsHash,
  getNoticeOfWorkApplicationProgressStatusCodeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { COLOR } from "@/constants/styles";
import * as routes from "@/constants/routes";

/**
 * @constant NOWProgressStatus conditionally show a status indicator of the various stages on a NoW record based off certain conditions (ie, Rejected, Permit issued, client delay, stages completed, etc)
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  tab: PropTypes.string.isRequired,
  progressStatusHash: PropTypes.objectOf(PropTypes.string).isRequired,
  showProgress: PropTypes.bool,
};

const defaultProps = { showProgress: true };

export const NOWProgressStatus = (props) => {
  const showStatus =
    props.tab !== "ADMIN" && props.tab !== "PRO" && props.tab !== "MND" && props.showProgress;
  return (
    <div>
      {isEmpty(props.progress[props.tab]) && showStatus && (
        <p className="small-p">
          {props.progressStatusHash[props.tab]} Status:{" "}
          <Badge
            color={COLOR.mediumGrey}
            className="padding-sm--left progress-status"
            text="Not Started"
          />
        </p>
      )}
      {!isEmpty(props.progress[props.tab]) && !props.progress[props.tab].end_date && showStatus && (
        <>
          <p className="small-p">
            {props.progressStatusHash[props.tab]} Status:{" "}
            <Badge
              color={COLOR.blue}
              className="padding-sm--left progress-status"
              text="In Progress"
            />
          </p>
          <p className="small-p">
            In {props.progressStatusHash[props.tab]} Since:{" "}
            <Link
              className="small-p"
              to={routes.NOTICE_OF_WORK_APPLICATION.hashRoute(
                props.noticeOfWork.now_application_guid,
                "administrative",
                "#progress-tracking"
              )}
            >
              {formatDate(props.progress[props.tab].start_date)}/
              {props.progress[props.tab].duration || "0 Days"}
            </Link>
          </p>
        </>
      )}
      {!isEmpty(props.progress[props.tab]) && props.progress[props.tab].end_date && showStatus && (
        <>
          <p className="small-p">
            {props.progressStatusHash[props.tab]} Status:
            <Badge
              color={COLOR.successGreen}
              className="padding-sm--left progress-status"
              text="Complete"
            />
          </p>
          <p className="small-p">
            {props.progressStatusHash[props.tab]} Started on:
            <Link
              className="small-p"
              to={routes.NOTICE_OF_WORK_APPLICATION.hashRoute(
                props.noticeOfWork.now_application_guid,
                "administrative",
                "#progress-tracking"
              )}
            >
              {formatDate(props.progress[props.tab].start_date)}/
              {props.progress[props.tab].duration || "0 Days"}
            </Link>
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
