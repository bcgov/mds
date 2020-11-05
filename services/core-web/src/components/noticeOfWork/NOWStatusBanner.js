/* eslint-disable */
import React from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { Alert } from "antd";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";

/**
 * @constant NOWStatusBanner conditionally show a status banner on all tabs based off certain conditions (ie, Rejected, Permit issued, client delay, stages completed, etc)
 * persists permissions using authWrapper - These actions are not visible to admin if disabled.
 * Colors: Complete = green
 * Rejected/WithDrawn = red
 * client delay = gold
 * editMode = purple
 * permit issued = green?
 *
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  isComplete: PropTypes.string,
  isEditMode: PropTypes.bool,
};

const defaultProps = { isComplete: "", isEditMode: false };

export const NOWStatusBanner = (props) => {
  const message = "";
  return (
    <Alert
      showIcon={false}
      message={message}
      banner
      // hiding it for now until the logic gets added
      style={{ backgroundColor: "#faad14", display: "none" }}
      className="status-banner"
    />
  );
};

NOWStatusBanner.propTypes = propTypes;
NOWStatusBanner.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  // can update color and message based on 'complete' state
  noticeOfWork: getNoticeOfWork(state),
});

export default withRouter(connect(mapStateToProps)(NOWStatusBanner));
