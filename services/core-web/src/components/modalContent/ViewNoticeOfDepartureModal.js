import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

export const ViewNoticeOfDepartureModal = (props) => {
  const { noticeOfDeparture } = props;

  return (
    <div>
      <div>
        <h4 className="nod-modal-section-header">Basic Information</h4>
        <div className="content--light-grey nod-section-padding">
          <div className="inline-flex padding-sm">
            <p className="field-title">Departure Project Title</p>
            <p>{noticeOfDeparture.nod_title || Strings.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title">Departure Summary</p>
            <p>{noticeOfDeparture.nod_description || Strings.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title">Permit #</p>
            <p>{noticeOfDeparture.permit.permit_no || Strings.EMPTY_FIELD}</p>
          </div>
          <div>
            <div className="inline-flex padding-sm">
              <p className="field-title">NOD #</p>
              <p>{noticeOfDeparture.key || Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-sm">
              <p className="field-title">Declared Type</p>
              <p>{noticeOfDeparture.nod_type || Strings.EMPTY_FIELD}</p>
            </div>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title">Submitted</p>
            <p>{noticeOfDeparture.submitted_at || Strings.EMPTY_FIELD}</p>
          </div>
        </div>
      </div>

      <div className="right center-mobile">
        <Button
          className="full-mobile nod-cancel-button"
          type="secondary"
          onClick={props.closeModal}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

ViewNoticeOfDepartureModal.propTypes = propTypes;

export default ViewNoticeOfDepartureModal;
