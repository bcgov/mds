/* eslint-disable */
import React from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { Alert } from "antd";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";

/**
 * @constant NOWStatusIndicator conditionally show a status banner on all tabs based off certain conditions (ie, Rejected, Permit issued, client delay, stages completed, etc)

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
  isComplete: PropTypes.string,
  isEditMode: PropTypes.bool,
};

const defaultProps = { isComplete: "", isEditMode: false };

export const NOWStatusIndicator = (props) => {
  const message = "Complete";
  return (
    <Alert
      showIcon={false}
      message={message}
      banner
      // hiding it for now until the logic gets added
      style={{
        background: "linear-gradient(90deg, #45A766 0%, #45A766 28.89%, rgba(127,254,0,0.13) 100%)",
        display: "none",
      }}
      className="status-banner"
    />
  );
};

NOWStatusIndicator.propTypes = propTypes;
NOWStatusIndicator.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  // can update color and message based on 'complete' state
  noticeOfWork: getNoticeOfWork(state),
});

export default withRouter(connect(mapStateToProps)(NOWStatusIndicator));
