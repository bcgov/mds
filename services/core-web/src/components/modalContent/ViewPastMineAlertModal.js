import React from "react";
import PropTypes from "prop-types";
import { PastMineAlertList } from "@/components/mine/PastMineAlertList";
import customPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineAlerts: customPropTypes.mine.isRequired,
};

export const ViewPastMineAlertModal = (props) => (
  <div>
    <PastMineAlertList
      closeModal={props.closeModal}
      alerts={props.mineAlerts}
      title={props.title}
      {...props}
    />
  </div>
);

ViewPastMineAlertModal.propTypes = propTypes;

export default ViewPastMineAlertModal;
