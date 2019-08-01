import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { VarianceDetails } from "@/components/dashboard/mine/variances/VarianceDetails";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const ViewVarianceModal = (props) => (
    <div>
      <VarianceDetails
        variance={props.variance}
        mineName={props.mineName}
        isViewOnly
        varianceStatusOptionsHash={props.varianceStatusOptionsHash}
        complianceCodesHash={props.complianceCodesHash}
      />
      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={props.closeModal}>
          Close
        </Button>
      </div>
    </div>
  );

ViewVarianceModal.propTypes = propTypes;

export default ViewVarianceModal;
