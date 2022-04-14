import React from "react";
// import PropTypes from "prop-types";
import NoticeOfDepartureDetails from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureDetails";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  // closeModal: PropTypes.func.isRequired,
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

export const ViewNoticeOfDepartureModal = (props) => (
  <div>
    <NoticeOfDepartureDetails noticeOfDeparture={props.noticeOfDeparture} />
  </div>
);

ViewNoticeOfDepartureModal.propTypes = propTypes;

export default ViewNoticeOfDepartureModal;
