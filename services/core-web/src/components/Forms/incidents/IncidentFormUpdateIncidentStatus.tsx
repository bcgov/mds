import React, { FC } from "react";
import { IMineIncident } from "@mds/common";
import { Alert, Button, Col, Form, Row, Typography } from "antd";
import { formatDate } from "@common/utils/helpers";
import { Field } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required } from "@common/utils/Validate";

interface IncidentFormUpdateIncidentStatusProps {
  incident: IMineIncident;
  dropdownIncidentStatusCodeOptions: any[];
  incidentStatusCodeHash: any;
  isEditMode: boolean;
  formValues: Partial<IMineIncident>;
  pristine: boolean;
}

const IncidentFormUpdateIncidentStatus: FC<IncidentFormUpdateIncidentStatusProps> = ({
  incident,
  dropdownIncidentStatusCodeOptions,
  incidentStatusCodeHash,
  isEditMode,
  formValues,
  pristine,
}) => {
  const isNewIncident = !incident?.mine_incident_guid;
  const isClosed = incident?.status_code === "CLD";
  const selectedStatusCode = formValues.status_code;
  const responsibleInspector = incident?.responsible_inspector_party;

  const alertText = (updateUser, updateDate, responsibleInspector, selectedStatusCode) => {
    let text = "";

    if (selectedStatusCode === "UNR" && !responsibleInspector) {
      text = `Please select an inspector responsible for this incident before changing the status to "Under Review".`;
    } else {
      switch (selectedStatusCode) {
        case "WNS":
          text = `This incident was submitted on ${formatDate(
            updateDate
          )} by ${updateUser} and has not yet been reviewed.`;
          break;
        case "UNR":
          text = `This incident currently under review by ${responsibleInspector}.`;
          break;
        case "RSS":
          text = `This incident's severity may have incorrectly been determined by the proponent, further clarification is being requested by the proponent.`;
          break;
        case "IMS":
          text = `This incident is missing critical information. The proponent has been notified that further information is required.`;
          break;
        case "AFR":
          text = `The incident requires a final report to be submitted before 60 days from creation time of the incident.`;
          break;
        case "INV":
          text = `This incident currently is under EMLI investigation.`;
          break;
        case "MIU":
          text = `This incident currently is under MIU investigation.`;
          break;
        case "FRS":
          text = `Final report submitted.`;
          break;
        case "CLD":
          text = `This incident was closed on ${formatDate(updateDate)} by ${updateUser}.`;
          break;
        case "DFT":
          text = `This incident currently is under draft ${formatDate(
            updateDate
          )} by ${updateUser}.`;
          break;
        default:
          break;
      }
    }

    return <Typography.Text>{text}</Typography.Text>;
  };

  return !isNewIncident ? (
    <div className="ant-form-vertical">
      <Col span={24}>
        <Alert
          message={incidentStatusCodeHash[incident?.status_code] || "Undefined Status"}
          description={
            <Row>
              <Col xs={24} md={18}>
                <p>
                  {alertText(
                    incident?.update_user,
                    incident?.update_timestamp,
                    responsibleInspector,
                    selectedStatusCode
                  )}
                </p>
              </Col>
              <Col xs={24} md={6}>
                {!isClosed && isEditMode && (
                  <Form.Item>
                    <Field
                      id="status_code"
                      name="status_code"
                      label=""
                      placeholder="Action"
                      component={renderConfig.SELECT}
                      validate={[required]}
                      data={dropdownIncidentStatusCodeOptions}
                    />
                  </Form.Item>
                )}
                {!pristine && !isClosed && (
                  <div className="right center-mobile">
                    <Button
                      className="full-mobile"
                      type="primary"
                      htmlType="submit"
                      disabled={selectedStatusCode === "UNR" && !responsibleInspector}
                    >
                      Update Status
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          }
          type={!isClosed ? "warning" : "info"}
          showIcon
          style={{
            backgroundColor: isClosed ? "#FFFFFF" : "",
            border: isClosed ? "1.5px solid #5e46a1" : "",
          }}
          className={isClosed ? "ant-alert-info ant-alert-info-custom-core-color-icon" : null}
        />
      </Col>
    </div>
  ) : null;
};

export default IncidentFormUpdateIncidentStatus;
