import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Button, Popconfirm } from "antd";
import { ELLIPSE } from "@/constants/assets";
import { VarianceDetails } from "../mine/Variances/VarianceDetails";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  varianceStatusOptions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const ViewVarianceModal = (props) => (
  <div>
    <div className="inline-flex between">
      <div>
        <h5>Lead Inspector</h5>
        <p>{props.variance.variance_application_status_code}</p>
      </div>
      <div>
        <h5>Application Status</h5>
        <div style={{ display: "inline-flex" }}>
          <img className="padding-right icon-sm--img" src={ELLIPSE} alt="status" />
          <p>{props.varianceStatusOptions[props.variance.variance_application_status_code]}</p>
        </div>
      </div>
      <div>
        <h5>Approval Status</h5>
        <div style={{ display: "inline-flex" }}>
          <img className="padding-right icon-sm--img" src={ELLIPSE} alt="status" />
          <p>{props.variance.variance_application_status_code}</p>
        </div>
      </div>
    </div>
    <VarianceDetails variance={props.variance} mineName={props.mineName} />
    <br />
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
    </div>
  </div>
);

ViewVarianceModal.propTypes = propTypes;

export default ViewVarianceModal;
