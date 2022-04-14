import React from "react";
// import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

export const NoticeOfDepartureDetails = (props) => {
  console.log(props.noticeOfDeparture);
  return (
    <div>
      <p>hello</p>
    </div>
  );
};

NoticeOfDepartureDetails.propTypes = propTypes;

export default NoticeOfDepartureDetails;
