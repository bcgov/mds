import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";

import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  removeDocument: PropTypes.func,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isViewOnly: PropTypes.bool,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  removeDocument: () => {},
  isViewOnly: false,
};

export const VarianceDetails = (props) => (
  <div>
    <div className="content--light-grey padding-small">
      <div className="inline-flex padding-small">
        <p className="field-title">Mine</p>
        <p> {props.mineName || Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Variance Number</p>
        <p> {props.variance.variance_no || Strings.EMPTY_FIELD}</p>
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
      {props.isViewOnly && (
        <div>
          <div className="inline-flex padding-small">
            <p className="field-title">Issue date</p>
            <p>{formatDate(props.variance.issue_date) || Strings.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Expiry date</p>
            <p>{formatDate(props.variance.expiry_date) || Strings.EMPTY_FIELD}</p>
          </div>
        </div>
      )}
      <div className="inline-flex padding-small">
        <p className="field-title">Description</p>
        <p>{props.variance.note || Strings.EMPTY_FIELD}</p>
      </div>
      {props.isViewOnly && (
        <div className="inline-flex padding-small">
          <p className="field-title">Affected parties have been notified</p>
          <p>{props.variance.parties_notified_ind ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
    <br />
    <h5>documents</h5>
    <DocumentTable
      documents={props.variance.documents}
      removeDocument={props.removeDocument}
      isViewOnly={props.isViewOnly}
      documentCategoryOptionsHash={props.documentCategoryOptionsHash}
    />
  </div>
);

VarianceDetails.propTypes = propTypes;
VarianceDetails.defaultProps = defaultProps;

export default VarianceDetails;
