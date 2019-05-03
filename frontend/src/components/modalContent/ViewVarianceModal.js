import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Button, Popconfirm } from "antd";
import { formatDate } from "@/utils/helpers";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  mineName: PropTypes.string.isRequired,
};

export const ViewVarianceModal = (props) => (
  <div>
    <div className="inline-flex between">
      <div>
        <h5>Lead Inspector</h5>
      </div>
      <div>
        <h5>Application Status</h5>
      </div>
      <div>
        <h5>Approval Status</h5>
      </div>
    </div>
    <h5>application details</h5>
    <br />
    <div className="content--light-grey padding-small">
      <div className="inline-flex padding-small">
        <p className="field-title">Mine:</p>
        <p> {props.mineName || String.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Part of Code:</p>
        <p>{props.variance.compliance_article_id || String.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Submission date:</p>
        <p>{formatDate(props.variance.received_date) || String.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">OHSC Union:</p>
        <p>{props.variance.ohsc_ind ? "Yes" : "No"} </p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Union:</p>
        <p>{props.variance.union_ind ? "Yes" : "No"} </p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Description:</p>
        <p>{props.variance.note || String.EMPTY_FIELD}</p>
      </div>
    </div>
    <br />
    <h5>documents</h5>
    <DocumentTable documents={props.variance.documents} />
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
