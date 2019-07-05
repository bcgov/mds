/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { Button, Tag } from "antd";
import * as Strings from "@/constants/strings";
import DocumentTable from "@/components/common/DocumentTable";
import { getInspectorsHash } from "@/selectors/partiesSelectors";
import {
  getHSRCMComplianceCodesHash,
  getIncidentDeterminationHash,
} from "@/selectors/staticContentSelectors";
import { formatTime, formatDate } from "@/utils/helpers";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  incident: CustomPropTypes.incident.isRequired,
};

export class ViewVarianceModal extends Component {
  renderInitialDetails = () => {
    const formattedPhoneNo = this.props.incident.reported_by_phone_ext
      ? `${this.props.incident.reported_by_phone_no} ext: ${
          this.props.incident.reported_by_phone_ext
        }`
      : this.props.incident.reported_by_phone_no;
    return (
      <div>
        <h5>Initial Report</h5>
        <div className="content--light-grey padding-small">
          <div className="inline-flex padding-small">
            <p className="field-title">Incident reported to</p>
            <p>
              {this.props.inspectorsHash[this.props.incident.reported_to_inspector_party_guid] ||
                Strings.EMPTY_FIELD}
            </p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Inspector responsible</p>
            <p>
              {this.props.inspectorsHash[this.props.incident.responsible_inspector_party_guid] ||
                Strings.EMPTY_FIELD}
            </p>
          </div>
          <div>
            <div className="inline-flex padding-small">
              <p className="field-title">Reported by</p>
              <p>{this.props.incident.reported_by_name || Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Phone number</p>
              <p>{formattedPhoneNo || Strings.EMPTY_FIELD}</p>
            </div>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Date reported</p>
            <p>{formatDate(this.props.incident.reported_timestamp) || Strings.EMPTY_FIELD}</p>
          </div>

          <div className="inline-flex padding-small">
            <p className="field-title">Time reported</p>
            <p>{formatTime(this.props.incident.reported_timestamp) || Strings.EMPTY_FIELD}</p>
          </div>
        </div>
        <br />
      </div>
    );
  };

  renderIncidentDetails = () => (
    <div>
      <h5>Incident Details</h5>
      <div className="content--light-grey padding-small">
        <div className="inline-flex padding-small">
          <p className="field-title">Incident date</p>
          <p>{formatDate(this.props.incident.incident_timestamp) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Incident time</p>
          <p>{formatTime(this.props.incident.incident_timestamp) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Number of fatalities</p>
          <p>{this.props.incident.number_of_fatalities || Strings.EMPTY_FIELD}</p>
        </div>

        <div>
          <div className="inline-flex padding-small">
            <p className="field-title">Number of injuries</p>
            <p>{this.props.incident.number_of_injuries || Strings.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Were emergency services called?</p>
            <p>{this.props.incident.emergency_services_called ? "Yes" : "No"}</p>
          </div>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Brief description of incident</p>
          <p>{this.props.incident.incident_description || Strings.EMPTY_FIELD}</p>
        </div>

        <div className="inline-flex padding-small">
          <p className="field-title">Inspectors determination</p>
          <p>
            {this.props.incidentDeterminationHash[this.props.incident.determination_type_code] ||
              Strings.EMPTY_FIELD}
          </p>
        </div>
        {this.props.incident.determination_type_code === Strings.DANGEROUS_OCCURRENCE && (
          <div className="padding-small">
            <p className="field-title">
              Which section(s) of the code applies to this dangerous occurrence?
            </p>
            {this.props.incident.dangerous_occurrence_subparagraph_ids.length >= 1 ? (
              <div className="block">
                {this.props.incident.dangerous_occurrence_subparagraph_ids.map((code) => (
                  <Tag>{this.props.complianceCodesHash[code]}</Tag>
                ))}
              </div>
            ) : (
              <p>{Strings.EMPTY_FIELD}</p>
            )}
          </div>
        )}
        <div className="inline-flex padding-small">
          <p className="field-title">Who made the determination?</p>
          <p>
            {this.props.inspectorsHash[this.props.incident.determination_inspector_party_guid] ||
              Strings.EMPTY_FIELD}
          </p>
        </div>
      </div>
      <br />
    </div>
  );

  renderInitialDocuments = () => (
    <div>
      <h5>Initial Report Documents</h5>
      <DocumentTable documents={this.props.incident.documents} isViewOnly />
      <br />
    </div>
  );

  renderFollowUpInformation = () => (
    <div>
      <h5>Follow-up information</h5>
      <div className="content--light-grey padding-small">
        <div className="inline-flex padding-small">
          <p className="field-title">Was there a follow-up inspection?</p>
          <p> {this.props.incident.followup_inspection ? "Yes" : "No"}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Incident time</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Was it escilated to EMPR Investigation?</p>
          <p>{Strings.EMPTY_FIELD}</p>
        </div>
        <div className="padding-small">
          <p className="field-title">Mine managers recommendations</p>
          {this.props.incident.recommendations.length >= 1 ? (
            <div className="block">
              {this.props.incident.recommendations.map(({ recommendation }) => (
                <p>{recommendation}</p>
              ))}
            </div>
          ) : (
            <p>{Strings.EMPTY_FIELD}</p>
          )}
        </div>
        <div>
          <div className="inline-flex padding-small">
            <p className="field-title">Incident Status</p>
            <p>{Strings.EMPTY_FIELD}</p>
          </div>
        </div>
      </div>
      <br />
    </div>
  );

  renderFinalDocuments = () => (
    <div>
      <h5>Final Investigation Report Documents</h5>
      <DocumentTable documents={[]} isViewOnly />
      <br />
    </div>
  );

  render() {
    console.log(this.props.incident);
    return (
      <div>
        {this.renderInitialDetails()}
        {this.renderIncidentDetails()}
        {this.renderInitialDocuments()}
        {this.renderFollowUpInformation()}
        {this.renderFinalDocuments()}
        <div className="right center-mobile">
          <Button className="full-mobile" type="secondary" onClick={this.props.closeModal}>
            Close
          </Button>
        </div>
      </div>
    );
  }
}

ViewVarianceModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  inspectorsHash: getInspectorsHash(state),
});

export default connect(mapStateToProps)(ViewVarianceModal);
