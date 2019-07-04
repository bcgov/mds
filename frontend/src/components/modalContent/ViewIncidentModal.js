/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { Button } from "antd";
import * as Strings from "@/constants/strings";
import DocumentTable from "@/components/common/DocumentTable";
import { getInspectorsHash } from "@/selectors/partiesSelectors";
import {
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
  getVarianceDocumentCategoryOptionsHash,
} from "@/selectors/staticContentSelectors";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  incident: CustomPropTypes.incident.isRequired,
};

const renderInitialDetails = (incident) => {
  const formattedPhoneNo = incident.reported_by_phone_ext
    ? `${incident.reported_by_phone_no} ext: ${incident.reported_by_phone_ext}`
    : incident.reported_by_phone_no;
  return (
    <div>
      <h5>Initial Report</h5>
      <div className="content--light-grey padding-small">
        <div className="inline-flex padding-small">
          <p className="field-title">Incident reported to</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Inspector responsible</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>
        <div>
          <div className="inline-flex padding-small">
            <p className="field-title">Reported by</p>
            <p>{incident.reported_by_name || Strings.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Phone number</p>
            <p>{formattedPhoneNo || Strings.EMPTY_FIELD}</p>
          </div>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Date reported</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>

        <div className="inline-flex padding-small">
          <p className="field-title">Time reported</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>
      </div>
    </div>
  );
};

const renderIncidentDetails = (incident) => (
  <div>
    <h5>Incident Details</h5>
    <div className="content--light-grey padding-small">
      <div className="inline-flex padding-small">
        <p className="field-title">Incident date</p>
        <p> {Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Incident time</p>
        <p>{Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Number of fatalities</p>
        <p>{incident.number_of_fatalities || Strings.EMPTY_FIELD}</p>
      </div>

      <div>
        <div className="inline-flex padding-small">
          <p className="field-title">Number of injuries</p>
          <p>{incident.number_of_injuries || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Were emergency services called?</p>
          <p>{incident.emergency_services_called ? "Yes" : "No"}</p>
        </div>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Brief description of incident</p>
        <p>{Strings.EMPTY_FIELD}</p>
      </div>

      <div className="inline-flex padding-small">
        <p className="field-title">Inspectors determination</p>
        <p>{Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">
          Which section(s) of the code applies to this dangerous occurrence?
        </p>
        <p>{Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Who made the determination?</p>
        <p>{Strings.EMPTY_FIELD}</p>
      </div>
    </div>
  </div>
);

const renderInitialDocuments = (incident) => (
  <div>
    <h5>Initial Report Documents</h5>
    <DocumentTable documents={[]} isViewOnly />
  </div>
);

const renderFollowUpInformation = (incident) => (
  <div>
    <h5>Follow-up information</h5>
    <div className="content--light-grey padding-small">
      <div className="inline-flex padding-small">
        <p className="field-title">Was there a follow-up inspection?</p>
        <p> {incident.followup_inspection ? "Yes" : "No"}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Incident time</p>
        <p>{Strings.EMPTY_FIELD}</p>
      </div>
      <div className="inline-flex padding-small">
        <p className="field-title">Was it escilated to EMPR Investigation?</p>
        <p>{Strings.EMPTY_FIELD}</p>
      </div>

      <div>
        <div className="inline-flex padding-small">
          <p className="field-title">Mine managers recommendations</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Incident Status</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>
      </div>
    </div>
  </div>
);

const renderFinalDocuments = () => (
  <div>
    <h5>Final Investigation Report Documents</h5>
    <DocumentTable documents={[]} isViewOnly />
  </div>
);

export const ViewVarianceModal = (props) => (
  <div>
    {renderInitialDetails(props.incident)}
    {renderIncidentDetails(props.incident)}
    {renderInitialDocuments(props.incident)}
    {renderFollowUpInformation(props.incident)}
    {renderFinalDocuments(props.incident)}
    <div className="right center-mobile">
      <Button className="full-mobile" type="secondary" onClick={props.closeModal}>
        Close
      </Button>
    </div>
  </div>
);

ViewVarianceModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  inspectorsHash: getInspectorsHash(state),
  documentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
});

export default connect(mapStateToProps)(ViewVarianceModal);
