import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Button } from "antd";
import * as Strings from "@/constants/strings";
import { VarianceDetails } from "@/components/dashboard/mine/variances/VarianceDetails";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const ViewVarianceModal = (props) => {
  const isApproved =
    props.variance.variance_application_status_code === Strings.VARIANCE_APPROVED_CODE;
  const isOverdue =
    props.variance.expiry_date && Date.parse(props.variance.expiry_date) < new Date();
  return (
    <div>
      <div className="inline-flex between block-tablet">
        <div className="flex-tablet">
          <p className="field-title">Application Status</p>
          <p>{props.varianceStatusOptionsHash[props.variance.variance_application_status_code]}</p>
        </div>
        {isApproved && (
          <div className="flex-tablet">
            <p className="field-title">Approval Status</p>
            <p>{isOverdue ? "Expired" : "Active"}</p>
          </div>
        )}
      </div>
      <br />
      <p className="field-title">{isApproved ? "Variance details" : "Application details"}</p>
      <VarianceDetails
        variance={props.variance}
        mineName={props.mineName}
        isViewOnly
        complianceCodesHash={props.complianceCodesHash}
      />
      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={props.closeModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

ViewVarianceModal.propTypes = propTypes;

export default ViewVarianceModal;
