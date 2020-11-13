/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { Alert, Badge, Tooltip } from "antd";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import {
  getNoticeOfWork,
  getApplicationDelay,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";
import { getDelayTypeOptionsHash } from "@common/selectors/staticContentSelectors";

/**
 * @constant NOWStatusIndicator conditionally show a status indicator of the various stages on a NoW record based off certain conditions (ie, Rejected, Permit issued, client delay, stages completed, etc)
 * Indicator Types and Location:
 * Tab header Badge
 * Fixed Header Banner
 * Decision Timeline
 * Colors:
 * Complete =  linear-gradient(90deg, #45A766 0%, #45A766 28.89%, rgba(127,254,0,0.13) 100%);
 * Rejected/WithDrawn =  linear-gradient(77.2deg, #D40D0D 0%, #E70000 28.89%, #FFFFFF 100%);
 * client delay =  linear-gradient(90deg, #FDBC00 0%, #FDBC00 28.89%, #FFF1A7 100%);
 * editMode =  linear-gradient(90deg, #5D46A1 0%, rgba(255,255,255,0.5) 100%);
 * permit issued = linear-gradient(90deg, #45A766 0%, #45A766 28.89%, rgba(127,254,0,0.13) 100%);
 *
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  isComplete: PropTypes.bool,
  isInProgress: PropTypes.bool,
  isEditMode: PropTypes.bool,
  type: PropTypes.string.isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
  delayTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  tabSection: PropTypes.string,
};

const defaultProps = { isComplete: false, isEditMode: false, isInProgress: false, tabSection: "" };

export class NOWStatusIndicator extends Component {
  state = { bannerColor: "", badgeColor: "", message: "", bannerVisible: true };

  componentDidMount() {
    this.handleIndicatorColor(
      this.props.applicationDelay,
      this.props.noticeOfWork.now_application_status_code,
      this.props.isEditMode,
      this.props.progress,
      this.props.tabSection
    );
  }

  componentWillReceiveProps(nextProps) {
    const delayChanged = this.props.applicationDelay !== nextProps.applicationDelay;
    const statusChanged =
      this.props.noticeOfWork.now_application_status_code !==
      nextProps.noticeOfWork.now_application_status_code;
    const progressChanged = this.props.progress !== nextProps.progress;

    if (delayChanged || statusChanged || progressChanged) {
      this.handleIndicatorColor(
        nextProps.applicationDelay,
        nextProps.noticeOfWork.now_application_status_code,
        nextProps.isEditMode,
        nextProps.progress,
        nextProps.tabSection
      );
    }
  }

  handleIndicatorColor = (applicationDelay, statusCode, isEditMode, progress, tabSection) => {
    const isApplicationDelayed = !isEmpty(applicationDelay);
    const isApplicationComplete =
      statusCode === "AIA" || statusCode === "WDN" || statusCode === "REJ";

    if (isApplicationComplete) {
      if (statusCode === "AIA") {
        this.setState({
          bannerColor:
            "linear-gradient(90deg, #45A766 0%, #45A766 28.89%, rgba(127,254,0,0.13) 100%)",
          badgeColor: "#45A766",
          message: "Application is Approved",
          bannerVisible: true,
        });
      } else {
        const message =
          statusCode === "WDN" ? "Application has been Withdrawn" : "Application has been Rejected";
        this.setState({
          bannerColor: "linear-gradient(77.2deg, #D40D0D 0%, #E70000 28.89%, #FFFFFF 100%)",
          badgeColor: "#D40D0D",
          message,
          bannerVisible: true,
        });
      }
    } else if (isApplicationDelayed) {
      this.setState({
        bannerColor: "linear-gradient(90deg, #FDBC00 0%, #FDBC00 28.89%, #FFF1A7 100%)",
        badgeColor: "#FDBC00",
        message: `Delayed: ${this.props.delayTypeOptionsHash[applicationDelay.delay_type_code]}`,
      });
    } else if (isEditMode) {
      this.setState({
        bannerColor: "linear-gradient(90deg, #5D46A1 0%, rgba(255,255,255,0.5) 100%)",
        message: "Edit Mode",
        bannerVisible: true,
      });
    } else if (!isEmpty(progress[tabSection])) {
      if (progress[tabSection].end_date) {
        this.setState({
          bannerColor:
            "linear-gradient(90deg, #45A766 0%, #45A766 28.89%, rgba(127,254,0,0.13) 100%)",
          badgeColor: "#45A766",
          message: "Complete",
          bannerVisible: true,
        });
      } else {
        this.setState({ bannerColor: "transparent", badgeColor: "yellow", message: "In Progress" });
      }
    } else {
      this.setState({
        bannerColor: "transparent",
        badgeColor: "",
        message: "",
        bannerVisible: false,
      });
    }
  };

  render() {
    return (
      <>
        {this.props.type === "banner" && (
          <Alert
            showIcon={false}
            message={this.state.message}
            banner
            style={{
              background: this.state.bannerColor,
              color: "#fff",
            }}
            className="status-banner"
          />
        )}
        {this.props.type === "badge" && (
          <Tooltip title={this.state.message} placement="top" mouseEnterDelay={0.3}>
            <Badge color={this.state.badgeColor} />
          </Tooltip>
        )}
      </>
    );
  }
}

NOWStatusIndicator.propTypes = propTypes;
NOWStatusIndicator.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  // can update color and message based on 'complete' state
  progress: getNOWProgress(state),
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplicationDelay(state),
  delayTypeOptionsHash: getDelayTypeOptionsHash(state),
});

export default withRouter(connect(mapStateToProps)(NOWStatusIndicator));
