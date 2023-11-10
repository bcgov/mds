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
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getDelayTypeOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { COLOR } from "@/constants/styles";

/**
 * @constant NOWStatusIndicator conditionally show a status indicator of the various stages on a NoW record based off certain conditions (ie, Rejected, Permit issued, client delay, stages completed, etc)
 * Indicator Types and Location:
 * Tab header Badge
 * Fixed Header Banner
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
  isEditMode: PropTypes.bool,
  type: PropTypes.string.isRequired,
  progress: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
  delayTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  tabSection: PropTypes.string,
};

const defaultProps = { isEditMode: false, tabSection: "" };

export class NOWStatusIndicator extends Component {
  state = {
    bannerColor: "",
    badgeColor: "",
    message: "",
    showBanner: true,
  };

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
    const editModeChanged = this.props.isEditMode !== nextProps.isEditMode;

    if (delayChanged || statusChanged || progressChanged || editModeChanged) {
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
      statusCode === "AIA" || statusCode === "WDN" || statusCode === "REJ" || statusCode === "NPR";

    if (isApplicationComplete) {
      if (statusCode === "AIA") {
        this.setState({
          bannerColor: COLOR.greenGradient,
          showBanner: true,
          badgeColor: COLOR.successGreen,
          message: "Application is Approved",
        });
      } else if (statusCode === "NPR") {
        this.setState({
          bannerColor: COLOR.greyGradient,
          showBanner: true,
          badgeColor: COLOR.darkGrey,
          message: "No Permit Required",
        });
      } else {
        const message =
          statusCode === "WDN" ? "Application has been Withdrawn" : "Application has been Rejected";
        this.setState({
          bannerColor: COLOR.redGradient,
          showBanner: true,
          badgeColor: COLOR.errorRed,
          message,
        });
      }
    } else if (isApplicationDelayed) {
      this.setState({
        bannerColor: COLOR.yellowGradient,
        showBanner: true,
        badgeColor: COLOR.yellow,
        message: `Delayed: ${this.props.delayTypeOptionsHash[applicationDelay.delay_type_code]}`,
      });
    } else if (isEditMode) {
      this.setState({
        bannerColor: COLOR.violetGradient,
        showBanner: true,
        message: "Edit Mode",
      });
    } else if (!isEmpty(progress[tabSection])) {
      if (progress[tabSection].end_date) {
        this.setState({
          bannerColor: COLOR.greenGradient,
          showBanner: true,
          badgeColor: COLOR.successGreen,
          message: "Complete",
        });
      } else {
        this.setState({
          bannerColor: "transparent",
          showBanner: false,
          badgeColor: COLOR.blue,
          message: "In Progress",
        });
      }
    } else {
      this.setState({
        bannerColor: "transparent",
        showBanner: false,
        badgeColor: COLOR.mediumGrey,
        message: "Not Started",
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
              color: COLOR.backgroundWhite,
              display: this.state.showBanner ? "" : "none",
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
  progress: getNOWProgress(state),
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplicationDelay(state),
  delayTypeOptionsHash: getDelayTypeOptionsHash(state),
});

export default withRouter(connect(mapStateToProps)(NOWStatusIndicator));
