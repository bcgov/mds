import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Tag, Table } from "antd";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
import {
  getHSRCMComplianceCodesHash,
  getIncidentDeterminationHash,
  getIncidentFollowupActionHash,
  getIncidentStatusCodeHash,
} from "@common/selectors/staticContentSelectors";
import { formatTime, formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  incident: CustomPropTypes.incident.isRequired,
  incidentStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentDeterminationHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentFollowupActionHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class ViewIncidentModal extends Component {
  state = { recommendationsExpanded: false };

  toggleRecommendations = () => {
    this.setState((prevState) => ({ recommendationsExpanded: !prevState.recommendationsExpanded }));
  };

  renderInitialDetails = () => {
    const formattedPhoneNo = this.props.incident.reported_by_phone_ext
      ? `${this.props.incident.reported_by_phone_no} ext: ${this.props.incident.reported_by_phone_ext}`
      : this.props.incident.reported_by_phone_no;

    return (
      <div>
        <h5>Initial Report</h5>
        <div className="content--light-grey padding-small">
          <div className="inline-flex padding-small">
            <p className="field-title">Incident type(s)</p>
            <p>
              {this.props.incident.categories && this.props.incident.categories.length > 0
                ? this.props.incident.categories
                    .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                    .map((c) => c.description)
                    .join(", ")
                : Strings.EMPTY_FIELD}
            </p>
          </div>
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
          <p>{this.props.incident.number_of_fatalities}</p>
        </div>
        <div>
          <div className="inline-flex padding-small">
            <p className="field-title">Number of injuries</p>
            <p>{this.props.incident.number_of_injuries}</p>
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
      </div>
      <br />
      <h5>Dangerous Occurance Determination</h5>
      <div className="content--light-grey padding-small">
        <div className="inline-flex padding-small">
          <p className="field-title">Inspector&apos;s determination</p>
          <p>
            {this.props.incidentDeterminationHash[this.props.incident.determination_type_code] ||
              Strings.EMPTY_FIELD}
          </p>
        </div>
        {this.props.incident.determination_type_code ===
          Strings.INCIDENT_DETERMINATION_TYPES.dangerousOccurance && (
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
          <p className="field-title">Inspector who made the determination</p>
          <p>
            {this.props.inspectorsHash[this.props.incident.determination_inspector_party_guid] ||
              Strings.EMPTY_FIELD}
          </p>
        </div>

        <div className="inline-flex padding-small">
          <p className="field-title">Mine&apos;s determination</p>
          <p>
            {this.props.incidentDeterminationHash[
              this.props.incident.mine_determination_type_code
            ] || Strings.EMPTY_FIELD}
          </p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Mine representative who made determination</p>
          <p>{this.props.incident.mine_determination_representative || Strings.EMPTY_FIELD}</p>
        </div>
      </div>
      <br />
    </div>
  );

  renderInitialDocuments = () => {
    const initialDocuments = this.props.incident.documents.filter(
      ({ mine_incident_document_type_code }) =>
        mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
    );
    return (
      <div>
        <h5>Initial Report Documents</h5>
        <Table
          align="left"
          pagination={false}
          columns={this.columns()}
          locale={{ emptyText: "This incident does not contain any initial documents" }}
          dataSource={this.transformRowData(initialDocuments)}
        />
        <br />
      </div>
    );
  };

  renderFollowUpInformation = () => (
    <div>
      <h5>Follow-up information</h5>
      <div className="content--light-grey padding-small">
        <div className="inline-flex padding-small">
          <p className="field-title">Was there a follow-up inspection?</p>
          <p> {this.props.incident.followup_inspection ? "Yes" : "No"}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Follow-up inspection date</p>
          <p>{formatDate(this.props.incident.followup_inspection_date) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Was it escalated to EMPR Investigation?</p>
          <p>
            {this.props.incidentFollowupActionHash[
              this.props.incident.followup_investigation_type_code
            ] || Strings.EMPTY_FIELD}
          </p>
        </div>
        <div className="padding-small">
          <p className="field-title">Mine managers recommendations</p>
          {this.props.incident.recommendations.length >= 1 ? (
            <div className="inline-flex">
              <div className={this.state.recommendationsExpanded ? "block" : "collapsed-container"}>
                {this.props.incident.recommendations.map(({ recommendation }) => (
                  <p>- {recommendation}</p>
                ))}
              </div>
              <Button className="btn--expand" onClick={() => this.toggleRecommendations()}>
                {this.state.recommendationsExpanded ? "see less" : "... see more"}
              </Button>
            </div>
          ) : (
            <p>{Strings.EMPTY_FIELD}</p>
          )}
        </div>
        <div>
          <div className="inline-flex padding-small">
            <p className="field-title">Incident Status</p>
            <p>
              {this.props.incidentStatusCodeHash[this.props.incident.status_code] ||
                Strings.EMPTY_FIELD}
            </p>
          </div>
        </div>
      </div>
      <br />
    </div>
  );

  renderFinalDocuments = () => {
    const finalDocuments = this.props.incident.documents.filter(
      ({ mine_incident_document_type_code }) =>
        mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
    );
    return (
      <div>
        <h5>Final Investigation Report</h5>
        <Table
          align="left"
          pagination={false}
          columns={this.columns()}
          locale={{ emptyText: "This incident does not contain any final documents" }}
          dataSource={this.transformRowData(finalDocuments)}
        />
        <br />
      </div>
    );
  };

  transformRowData = (documents) =>
    documents.map((document) => ({
      key: document.mine_document_guid,
      document_manager_guid: document.document_manager_guid,
      name: document.document_name,
    }));

  columns = () => [
    {
      title: "File name",
      dataIndex: "name",
      render: (text, record) => (
        <div title="File name">
          <LinkButton key={record.key} onClick={() => downloadFileFromDocumentManager(record)}>
            {text}
          </LinkButton>
        </div>
      ),
    },
  ];

  render() {
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

ViewIncidentModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  inspectorsHash: getInspectorsHash(state),
  incidentFollowupActionHash: getIncidentFollowupActionHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
});

export default connect(mapStateToProps)(ViewIncidentModal);
