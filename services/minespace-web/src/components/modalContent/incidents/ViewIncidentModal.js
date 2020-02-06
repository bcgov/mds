import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import IncidentDetails from "@/components/dashboard/mine/incidents/IncidentDetails";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  incident: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const ViewIncidentModal = (props) => (
  <div>
    <IncidentDetails incident={props.incident} />
    <div className="ant-modal-footer" style={{ paddingTop: "16px" }}>
      <Button onClick={props.closeModal}>Close</Button>
    </div>
  </div>
);

ViewIncidentModal.propTypes = propTypes;

export default ViewIncidentModal;
