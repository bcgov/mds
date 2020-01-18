import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";

import { formatDate } from "@/utils/helpers";
import DocumentTable from "@/components/common/DocumentTable";
import * as Strings from "@/constants/strings";

const propTypes = {
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  removeDocument: PropTypes.func,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isViewOnly: PropTypes.bool,
};

const defaultProps = {
  removeDocument: () => {},
  isViewOnly: false,
};

export const VarianceDetails = (props) => {
  const isApproved =
    props.variance.variance_application_status_code === Strings.VARIANCE_APPROVED_CODE;
  const isOverdue =
    props.variance.expiry_date && Date.parse(props.variance.expiry_date) < new Date();

  return (
    <div>
      <div className="inline-flex between block-tablet margin--bottom">
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
      <p className="field-title margin--bottom">
        {isApproved ? "Variance details" : "Application details"}
      </p>
      <div className="background-bg padding-small margin--bottom">
        <div className="inline-flex padding-small">
          <p className="field-title">Mine</p>
          <p> {props.mineName || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Part of Code</p>
          <p>
            {props.variance.compliance_article_id
              ? props.complianceCodesHash[props.variance.compliance_article_id]
              : Strings.EMPTY_FIELD}
          </p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Submission date</p>
          <p>{formatDate(props.variance.received_date) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Description</p>
          <p>{props.variance.note || Strings.EMPTY_FIELD}</p>
        </div>
      </div>
      <p className="field-title">Documents</p>
      <DocumentTable
        documents={props.variance.documents}
        removeDocument={props.removeDocument}
        isViewOnly={props.isViewOnly}
        documentCategoryOptionsHash={props.documentCategoryOptionsHash}
      />
    </div>
  );
};

VarianceDetails.propTypes = propTypes;
VarianceDetails.defaultProps = defaultProps;

export default VarianceDetails;
