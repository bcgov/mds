import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import { Col, Divider, Row, Typography } from "antd";
import { required, maxLength, wholeNumber, dateNotInFuture } from "@common/utils/Validate";
import * as Strings from "@mds/common/constants/strings";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import IncidentFileUpload from "./IncidentFileUpload";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

const defaultProps = {};

export const AddIncidentDetailForm = (props) => {
  return (
    <Form layout="vertical">
      <Row gutter={48}>
        <Col span={24}>
          <Typography.Text>
            <h4>Incident Details</h4>
          </Typography.Text>
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Form.Item label="Incident date">
                <Field
                  id="incident_date"
                  name="incident_date"
                  placeholder="Please select date"
                  component={renderConfig.DATE}
                  validate={[required, dateNotInFuture]}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Incident time">
                <Field
                  id="incident_time"
                  name="incident_time"
                  placeholder="Please select time"
                  component={renderConfig.TIME}
                  validate={[required]}
                  fullWidth
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Proponent incident number (optional)">
            <Field
              id="proponent_incident_no"
              name="proponent_incident_no"
              component={renderConfig.FIELD}
              validate={[maxLength(20)]}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Form.Item label="Number of injuries (optional)">
                <Field
                  id="number_of_injuries"
                  name="number_of_injuries"
                  component={renderConfig.FIELD}
                  validate={[wholeNumber, maxLength(10)]}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Number of fatalities (optional)">
                <Field
                  id="number_of_fatalities"
                  name="number_of_fatalities"
                  component={renderConfig.FIELD}
                  validate={[wholeNumber, maxLength(10)]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Were emergency services called? (optional)">
            <Field
              id="emergency_services_called"
              name="emergency_services_called"
              placeholder="Please choose one"
              component={renderConfig.RADIO}
            />
          </Form.Item>
          <Form.Item label="Description of incident">
            <Field
              id="incident_description"
              name="incident_description"
              placeholder="Provide a detailed description of the incident"
              component={renderConfig.SCROLL_FIELD}
              validate={[required]}
            />
          </Form.Item>
          <Divider />
          <Typography.Text>
            <h4>Dangerous Occurrence Determination</h4>
          </Typography.Text>
          <Form.Item label="Is this a dangerous occurrence? (optional)">
            <Field
              id="mine_determination_type_code"
              name="mine_determination_type_code"
              component={renderConfig.RADIO}
            />
          </Form.Item>
          <Form.Item label="Mine representative who made determination">
            <Field
              id="mine_determination_representative"
              name="mine_determination_representative"
              component={renderConfig.FIELD}
              validate={[maxLength(255)]}
            />
          </Form.Item>
          <Form.Item label="Initial Notification Documents">
            <Typography.Paragraph>
              Please upload all of the required documents.
            </Typography.Paragraph>
            <Field
              id="InitialIncidentFileUpload"
              name="InitialIncidentFileUpload"
              onFileLoad={(document_name, document_manager_guid) =>
                props.onFileLoad(
                  document_name,
                  document_manager_guid,
                  Strings.INCIDENT_DOCUMENT_TYPES.initial
                )
              }
              onRemoveFile={props.onRemoveFile}
              mineGuid={props.mineGuid}
              component={IncidentFileUpload}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

AddIncidentDetailForm.propTypes = propTypes;
AddIncidentDetailForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_INCIDENT,
  destroyOnUnmount: false,
  touchOnBlur: true,
  forceUnregisterOnUnmount: true,
})(AddIncidentDetailForm);
