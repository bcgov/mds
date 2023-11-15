import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";

import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceDocumentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isViewOnly: PropTypes.bool,
  removeDocument: PropTypes.func,
};

const defaultProps = {
  isViewOnly: false,
  removeDocument: () => {},
};

export const VarianceDetails = (props) => (
  <div>
    <div className="content--light-grey padding-sm">
      <div className="inline-flex padding-sm">
        <p className="field-title">Mine</p>
        <p> {props.mineName || Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-sm">
        <p className="field-title">Variance Number</p>
        <p> {props.variance.variance_no || Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-sm">
        <p className="field-title">Part of Code</p>
        <p>
          {props.variance.compliance_article_id
            ? props.complianceCodesHash[props.variance.compliance_article_id]
            : Strings.EMPTY_FIELD}
        </p>
      </div>
      <div className="inline-flex padding-sm">
        <p className="field-title">Submission Date</p>
        <p>{formatDate(props.variance.received_date) || Strings.EMPTY_FIELD}</p>
      </div>
      {props.isViewOnly && (
        <div>
          <div className="inline-flex padding-sm">
            <p className="field-title">Issue Date</p>
            <p>{formatDate(props.variance.issue_date) || Strings.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title">Expiry Date</p>
            <p>{formatDate(props.variance.expiry_date) || Strings.EMPTY_FIELD}</p>
          </div>
        </div>
      )}
      <div className="inline-flex padding-sm">
        <p className="field-title">Description</p>
        <p>{props.variance.note || Strings.EMPTY_FIELD}</p>
      </div>
      {props.isViewOnly && (
        <div className="inline-flex padding-sm">
          <p className="field-title">Affected Parties Have Been Notified</p>
          <p>{props.variance.parties_notified_ind ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
    <br />
    <h5>Documents</h5>
    <DocumentTable
      documents={(props.variance.documents || []).reduce(
        (docs, doc) => [
          {
            key: doc.mine_document_guid,
            mine_document_guid: doc.mine_document_guid,
            document_manager_guid: doc.document_manager_guid,
            document_name: doc.document_name,
            category:
              props.varianceDocumentCategoryOptionsHash[doc.variance_document_category_code],
            upload_date: doc.created_at,
          },
          ...docs,
        ],
        []
      )}
      removeDocument={props.removeDocument}
      isViewOnly={props.isViewOnly}
    />
  </div>
);

VarianceDetails.propTypes = propTypes;
VarianceDetails.defaultProps = defaultProps;

export default VarianceDetails;
