import React from "react";
import { withRouter } from "react-router-dom";
import { Checkbox, Card, Col, Divider, Input, Row, Typography } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import { formatTime, formatDate } from "@common/utils/helpers";
import DocumentTable from "@/components/common/DocumentTable";
import { uploadDateColumn, uploadedByColumn } from "@/components/common/DocumentColumns";
import Callout from "@/components/common/Callout";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  incident: PropTypes.objectOf(PropTypes.any).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      applicationSubmitted: PropTypes.bool,
    }),
  }),
  applicationSubmitted: PropTypes.bool,
};

const defaultProps = {
  applicationSubmitted: false,
  location: {
    state: {
      applicationSubmitted: false,
    },
  },
};

const documentColumns = [
  uploadedByColumn("Uploader", "update_user"),
  uploadDateColumn("upload_date"),
];

const renderInitialReport = (props) => (
  <Row>
    <Col span={24}>
      <Typography.Title level={4}>Initial Report</Typography.Title>
      <Typography.Paragraph>
        Select one or more incident types for this submission.
      </Typography.Paragraph>
      <p>Incident type(s)</p>
      <Input
        value={
          props.incident.categories && props.incident.categories.length > 0
            ? props.incident.categories
                .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                .map((c) => c.description)
                .join(", ")
            : Strings.EMPTY_FIELD
        }
      />
    </Col>
  </Row>
);

const renderReporterDetails = (props) => (
  <Row gutter={[16, 12]}>
    <Col span={24}>
      <Typography.Title level={4}>Reporter Details</Typography.Title>
      <Typography.Paragraph>
        Enter all available details about the reporter of this incident.
      </Typography.Paragraph>
    </Col>
    <Col xs={24} md={10}>
      <p>Reported by</p>
      <Input value={props.incident.reported_by_name} />
    </Col>
    <Col xs={24} md={10}>
      <p>Phone number (optional)</p>
      <Input value={props.incident.reported_by_phone_ext} />
    </Col>
    <Col xs={24} md={4}>
      <p>Ext.</p>
      <Input value={props.incident.reported_by_phone_ext} />
    </Col>
    <Col md={10} xs={24}>
      <p>Email (optional)</p>
      <Input value={props.incident.email} />
    </Col>
  </Row>
);

const renderIncidentDetails = (props) => (
  <Row gutter={[16, 12]}>
    <Col span={24}>
      <Typography.Title level={4}>Incident Details</Typography.Title>
      <Typography.Paragraph>
        Enter more information regarding the reported incident. Some fields may be marked as
        optional but help the ministry understand the nature of the incident, please consider
        including them.
      </Typography.Paragraph>
    </Col>
    <Col md={12} xs={24}>
      <p>Incident date</p>
      <Input value={formatDate(props.incident.reported_timestamp)} />
    </Col>
    <Col md={12} xs={24}>
      <p>Incident time</p>
      <Input value={formatTime(props.incident.reported_timestamp)} />
    </Col>
    <Col md={12} xs={24}>
      <p>Proponent incident number (optional)</p>
      <Input value={props.incident.proponent_incident_no} />
    </Col>
    <Col md={12} xs={24}>
      <p>Number of injuries (optional)</p>
      <Input value={props.incident.number_of_injuries} />
    </Col>
    <Col md={12} xs={24}>
      <p>Number of fatalities (optional)</p>
      <Input value={props.incident.number_of_fatalities} />
    </Col>
    <Col md={12} xs={24}>
      <p>Were emergency services called? (optional)</p>
      <Input value={props.incident.emergency_services_called ? "Yes" : "No"} />
    </Col>
    <Col span={24}>
      <p>Description of incident</p>
      <Input.TextArea rows={4} value={props.incident.incident_description} />
    </Col>
    <Col span={24}>
      <p>Immediate measures taken (optional)</p>
      <Input.TextArea rows={4} value={props.incident.measures_taken} />
    </Col>
    <Col span={24}>
      <p>If any injuries, please describe (optional)</p>
      <Input.TextArea rows={4} value={props.incident.injuries_description} />
    </Col>
    <Divider />
    <Col md={12} xs={24}>
      <p>JOHSC/Worker Rep Name (optional)</p>
      <Input value={props.incident.johsc_worker_rep_name} />
    </Col>
    <Col md={12} xs={24}>
      <p>Was this person contacted? (optional)</p>
      <Input value={props.incident.johsc_worker_rep_contacted ? "Yes" : "No"} />
    </Col>
    <Col md={12} xs={24}>
      <p>JOHSC/Management Rep Name (optional)</p>
      <Input value={props.incident.johsc_management_rep_name} />
    </Col>
    <Col md={12} xs={24}>
      <p>Was this person contacted? (optional)</p>
      <Input value={props.incident.johsc_management_rep_contacted ? "Yes" : "No"} />
    </Col>
  </Row>
);

const renderDangerousOccurenceDetermination = (props) => (
  <Row gutter={[16, 12]}>
    <Col span={24}>
      <Typography.Title level={4}>Dangerous Occurrence Determination</Typography.Title>
      <Typography.Paragraph>
        If you determine that this incident was a dangerous occurance will be required to submit
        your investigation report.
      </Typography.Paragraph>
    </Col>
    <Col md={12} xs={24}>
      <p>Was this a dangerous occurrence? (optional)</p>
      <Input value={props.incident.mine_determination_type_code ? "Yes" : "No"} />
    </Col>
    <Col md={12} xs={24}>
      <p>Mine representative who made determination (optional)</p>
      <Input value={props.incident.mine_determination_representative} />
    </Col>
  </Row>
);

const renderUploadInitialNotificationDocuments = (props) => {
  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3}>Record Files</Typography.Title>
        <Typography.Title level={4}>Initial Notification Documents</Typography.Title>
        <DocumentTable
          documents={props.incident?.documents}
          documentColumns={documentColumns}
          documentParent="Mine Incident"
        />
      </Col>
    </Row>
  );
};

const confirmationSubmission = (props, applicationSubmitted) =>
  !applicationSubmitted && (
    <Col span={24}>
      <Card>
        <>
          <p>
            <b>Confirmation of Submission</b>
          </p>
          <p>
            <span>
              <Checkbox
                checked={props.confirmedSubmission}
                onChange={props.setConfirmedSubmission}
              />
              &nbsp;&nbsp;
            </span>
            I understand that this application and supporting files are submitted on behalf of the
            owner, agent or mine manager of this project.
            <span style={{ color: "red" }}>*</span>
          </p>
        </>
      </Card>
      <br />
    </Col>
  );

export const IncidentReviewSubmit = (props) => {
  const applicationSubmitted =
    props?.applicationSubmitted || props?.location?.state?.applicationSubmitted;

  return (
    <>
      <Callout
        style={{ marginTop: 0 }}
        severity="warning"
        message={
          <>
            <b>Confirm your Submission</b>
            <p>
              Please confirm the contents of your submission below. When you are happy with your
              review click the submit button to begin the review process.
            </p>
          </>
        }
      />
      <Row>
        <Col span={16} offset={4}>
          {renderInitialReport(props)}
          <br />
          {renderReporterDetails(props)}
          <br />
          {renderIncidentDetails(props)}
          <br />
          {renderDangerousOccurenceDetermination(props)}
          <br />
          {renderUploadInitialNotificationDocuments(props)}
          <br />
          {confirmationSubmission(props, applicationSubmitted)}
        </Col>
      </Row>
    </>
  );
};

IncidentReviewSubmit.propTypes = propTypes;
IncidentReviewSubmit.defaultProps = defaultProps;

export default withRouter(IncidentReviewSubmit);
