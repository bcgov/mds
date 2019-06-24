import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { Button } from "antd";
import * as Strings from "@/constants/strings";
import { VarianceDetails } from "../mine/Variances/VarianceDetails";
import { getInspectorsHash } from "@/selectors/partiesSelectors";
import {
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
  getVarianceDocumentCategoryOptionsHash,
} from "@/selectors/staticContentSelectors";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
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
          <p className="field-title">Lead Inspector</p>
          <p>{props.inspectorsHash[props.variance.inspector_party_guid] || Strings.EMPTY_FIELD}</p>
        </div>
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
      <h5>{isApproved ? "Variance details" : "Application details"}</h5>
      <VarianceDetails
        variance={props.variance}
        mineName={props.mineName}
        isViewOnly
        complianceCodesHash={props.complianceCodesHash}
        documentCategoryOptionsHash={props.documentCategoryOptionsHash}
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

const mapStateToProps = (state) => ({
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  inspectorsHash: getInspectorsHash(state),
  documentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
});

export default connect(mapStateToProps)(ViewVarianceModal);
