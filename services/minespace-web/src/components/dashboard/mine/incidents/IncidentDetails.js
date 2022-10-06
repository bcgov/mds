// Disabled due to bug detecting propTypes as unused in static components:
/* eslint-disable react/no-unused-prop-types */
import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Typography, Tag, Tabs, Button, List } from "antd";
import { formatTime, formatDate, formatBooleanToString } from "@common/utils/helpers";
import {
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
  getIncidentCategoryCodeHash,
  getIncidentFollowupActionHash,
  getHSRCMComplianceCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
import * as Strings from "@/constants/strings";
import UploadedDocumentsTable from "@/components/common/UploadedDocumentsTable";

const propTypes = {
  incident: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentDeterminationHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentCategoryCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  incidentFollowupActionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const IncidentDetails = (props) => (
  <div>
    <Tabs type="card" tabPosition="left" defaultActiveKey="initial" className="vertical">
      <Tabs.TabPane tab="Initial Report" key="initial">
        <InitialReport {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Incident Details" key="details">
        <Details {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Initial Documents" key="initialdocs">
        <InitialDocuments {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Follow-up Information" key="followup">
        <FollowupInformation {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Final Documents" key="finaldocs">
        <FinalDocuments {...props} />
      </Tabs.TabPane>
    </Tabs>
  </div>
);

const IncidentField = (props) => (
  <Col sm={24} md={12}>
    <Typography.Paragraph>
      <Typography.Text className="color-primary" strong>
        {props.title}
      </Typography.Text>
      <br />
      <Typography.Text>{props.content || Strings.EMPTY_FIELD}</Typography.Text>
    </Typography.Paragraph>
  </Col>
);
const InitialReport = (props) => (
  <Row>
    <Col span={24}>
      <Typography.Title level={4}>Initial Report</Typography.Title>
      <IncidentField
        title="Incident type(s)"
        content={
          props.incident.categories && props.incident.categories.length > 0
            ? props.incident.categories
                .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                .map((c) => c.description)
                .join(", ")
            : Strings.EMPTY_FIELD
        }
      />

      <IncidentField
        title="Incident reported to"
        content={
          props.inspectorsHash[props.incident.reported_to_inspector_party_guid] ||
          Strings.EMPTY_FIELD
        }
      />

      <IncidentField
        title="Inspector responsible"
        content={
          props.inspectorsHash[props.incident.responsible_inspector_party_guid] ||
          Strings.EMPTY_FIELD
        }
      />

      <IncidentField title="Reported by" content={props.incident.reported_by_name} />

      <IncidentField
        title="Phone number"
        content={
          props.incident.reported_by_phone_ext
            ? `${props.incident.reported_by_phone_no} ext: ${props.incident.reported_by_phone_ext}`
            : props.incident.reported_by_phone_no
        }
      />

      <IncidentField
        title="Date reported"
        content={formatDate(props.incident.reported_timestamp)}
      />

      <IncidentField
        title="Time reported"
        content={formatTime(props.incident.reported_timestamp)}
      />
    </Col>
  </Row>
);
const Details = (props) => (
  <React.Fragment>
    <Row>
      <Col span={24}>
        <Typography.Title level={4}>Incident Details</Typography.Title>

        <IncidentField
          title="Incident date"
          content={formatDate(props.incident.incident_timestamp)}
        />

        <IncidentField
          title="Incident time"
          content={formatTime(props.incident.incident_timestamp)}
        />

        <IncidentField title="Number of fatalities" content={props.incident.number_of_fatalities} />

        <IncidentField title="Number of injuries" content={props.incident.number_of_injuries} />

        <IncidentField
          title="Were emergency services called?"
          content={props.incident.emergency_services_called ? "Yes" : "No"}
        />

        <IncidentField
          title="Brief description of incident"
          content={props.incident.incident_description}
        />
      </Col>
    </Row>

    <Row>
      <Col span={24}>
        <Typography.Title level={4}>Dangerous Occurrence Determination</Typography.Title>
        <IncidentField
          title="Inspector's determination"
          content={
            props.incidentDeterminationHash[props.incident.determination_type_code] ||
            Strings.EMPTY_FIELD
          }
        />

        {props.incident.determination_type_code === "DO" && (
          <IncidentField
            title="Which section(s) of the code applies to this dangerous occurrence?"
            content={
              props.incident.dangerous_occurrence_subparagraph_ids.length >= 1 ? (
                <div className="block">
                  {props.incident.dangerous_occurrence_subparagraph_ids.map((code) => (
                    <Tag>{props.complianceCodesHash[code]}</Tag>
                  ))}
                </div>
              ) : (
                Strings.EMPTY_FIELD
              )
            }
          />
        )}

        <IncidentField
          title="Inspector who made the determination"
          content={
            props.inspectorsHash[props.incident.determination_inspector_party_guid] ||
            Strings.EMPTY_FIELD
          }
        />

        <IncidentField
          title="Mine's determination"
          content={
            props.incidentDeterminationHash[props.incident.mine_determination_type_code] ||
            Strings.EMPTY_FIELD
          }
        />

        <IncidentField
          title="Mine representative who made determination"
          content={props.incident.mine_determination_representative}
        />
      </Col>
    </Row>
  </React.Fragment>
);
const InitialDocuments = (props) => (
  <Row>
    <Col span={24}>
      <Typography.Title level={4}>Preliminary Documents</Typography.Title>
      <UploadedDocumentsTable
        files={props.incident.documents.filter(
          (doc) => doc.mine_incident_document_type_code === "INI"
        )}
        showRemove={false}
      />
    </Col>
  </Row>
);
const FollowupInformation = (props) => {
  const [expandRecommendations, setExpandRecommendations] = useState(false);

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={4}>Follow-up Information</Typography.Title>
        <IncidentField
          title="Was there a follow-up inspection?"
          content={formatBooleanToString(props.incident.followup_inspection, String.EMPTY)}
        />

        <IncidentField
          title="Follow-up inspection date"
          content={formatDate(props.incident.followup_inspection_date)}
        />

        <IncidentField
          title="Was it escalated to EMLI Investigation?"
          content={
            props.incidentFollowupActionHash[props.incident.followup_investigation_type_code] ||
            Strings.EMPTY_FIELD
          }
        />
        <IncidentField
          title="Incident Status"
          content={props.incidentStatusCodeHash[props.incident.status_code]}
        />
        <IncidentField
          title="Mine manager's recommendations"
          content={
            props.incident.recommendations.length >= 1 && (
              <React.Fragment>
                <List>
                  {props.incident.recommendations
                    .slice(0, expandRecommendations ? props.incident.recommendations.length : 2)
                    .map((rec) => (
                      <List.Item>{rec.recommendation}</List.Item>
                    ))}
                </List>

                <Button
                  className="btn--expand"
                  onClick={() => setExpandRecommendations(!expandRecommendations)}
                >
                  {expandRecommendations ? "Show Less" : "Show More"}
                </Button>
              </React.Fragment>
            )
          }
        />
      </Col>
    </Row>
  );
};

const FinalDocuments = (props) => (
  <Row>
    <Col span={24}>
      <Typography.Title level={4}>Final Documents</Typography.Title>
      <UploadedDocumentsTable
        files={props.incident.documents.filter(
          (doc) => doc.mine_incident_document_type_code === "CLD"
        )}
        showRemove={false}
      />
    </Col>
  </Row>
);

IncidentField.propTypes = {
  title: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  content: PropTypes.any,
};
IncidentField.defaultProps = {
  content: Strings.EMPTY_FIELD,
};

InitialReport.propTypes = propTypes;
Details.propTypes = propTypes;
InitialDocuments.propTypes = propTypes;
FollowupInformation.propTypes = propTypes;
FinalDocuments.propTypes = propTypes;
IncidentDetails.propTypes = propTypes;

const mapStateToProps = (state) => ({
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
  incidentCategoryCodeHash: getIncidentCategoryCodeHash(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  inspectorsHash: getInspectorsHash(state),
  incidentFollowupActionHash: getIncidentFollowupActionHash(state),
});

export default connect(mapStateToProps)(IncidentDetails);
