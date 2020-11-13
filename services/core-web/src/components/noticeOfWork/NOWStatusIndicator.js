/* eslint-disable */
import React, { useState } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { Alert, Badge, Tooltip } from "antd";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import { getNoticeOfWork, getApplicationDelay } from "@common/selectors/noticeOfWorkSelectors";

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
  isComplete: PropTypes.string,
  isEditMode: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

const defaultProps = { isComplete: "", isEditMode: false };

export const NOWStatusIndicator = (props) => {
  const [color, setColor] = useState(
    "linear-gradient(90deg, #FDBC00 0%, #FDBC00 28.89%, #FFF1A7 100%)"
  );

  const isApplicationDelayed = !isEmpty(props.applicationDelay);
  const message = "Complete";
  return (
    <>
      {props.type === "banner" && (
        <Alert
          showIcon={false}
          message={message}
          banner
          style={{
            background: color,
            display: "none",
          }}
          className="status-banner"
        />
      )}
      {props.type === "badge" && (
        <Tooltip title="This will say the status" placement="top" mouseEnterDelay={0.3}>
          <Badge
            color={color}
            style={{
              display: "none",
            }}
          />
        </Tooltip>
      )}
    </>
  );
};

NOWStatusIndicator.propTypes = propTypes;
NOWStatusIndicator.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  // can update color and message based on 'complete' state
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplicationDelay(state),
});

export default withRouter(connect(mapStateToProps)(NOWStatusIndicator));
