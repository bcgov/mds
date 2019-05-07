import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
};

export const VarianceDetails = (props) => (
  <div>
    <h5>application details</h5>
    <div className="content--light-grey padding-small">
      <div className="inline-flex padding-small">
        <p className="field-title">Mine</p>
        <p> {props.mineName || String.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Part of Code</p>
        <p>{props.variance.compliance_article_id || String.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Submission date</p>
        <p>{formatDate(props.variance.received_date) || String.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">OHSC Union</p>
        <p>{props.variance.ohsc_ind ? "Yes" : "No"} </p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Union</p>
        <p>{props.variance.union_ind ? "Yes" : "No"} </p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Description</p>
        <p>{props.variance.note || String.EMPTY_FIELD}</p>
      </div>
    </div>
    <br />
    <h5>documents</h5>
    <DocumentTable documents={props.variance.documents} />
  </div>
);

VarianceDetails.propTypes = propTypes;

export default VarianceDetails;
