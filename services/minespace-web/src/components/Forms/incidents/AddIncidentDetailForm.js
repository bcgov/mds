import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import { Col, Row, Typography } from "antd";
import {
  required,
  maxLength,
  wholeNumber,
  dateNotInFuture,
  validateSelectOptions,
} from "@common/utils/Validate";
import * as Strings from "@common/constants/strings";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import IncidentFileUpload from "./IncidentFileUpload";

const { Text } = Typography;

const propTypes = {
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  mineGuid: PropTypes.string.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

const defaultProps = {};

// eslint-disable-next-line react/prefer-stateless-function
class AddIncidentDetailForm extends Component {
  render() {
    return (
      <Form layout="vertical">
        <Row gutter={48}>
          <Col span={24}>
            <Text>
              <h4>Incident Details</h4>
            </Text>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="incident_date"
                    name="incident_date"
                    label="Incident date"
                    placeholder="Please select date"
                    component={renderConfig.DATE}
                    validate={[required, dateNotInFuture]}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="incident_time"
                    name="incident_time"
                    label="Incident time"
                    placeholder="Please select time"
                    component={renderConfig.TIME}
                    validate={[required]}
                    fullWidth
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Field
                id="proponent_incident_no"
                name="proponent_incident_no"
                label="Proponent incident number (optional)"
                component={renderConfig.FIELD}
                validate={[maxLength(20)]}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="number_of_injuries"
                    name="number_of_injuries"
                    label="Number of injuries (optional)"
                    component={renderConfig.FIELD}
                    validate={[wholeNumber, maxLength(10)]}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="number_of_fatalities"
                    name="number_of_fatalities"
                    label="Number of fatalities (optional)"
                    component={renderConfig.FIELD}
                    validate={[wholeNumber, maxLength(10)]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Field
                id="emergency_services_called"
                name="emergency_services_called"
                label="Were emergency services called? (optional)"
                placeholder="Please choose one"
                component={renderConfig.RADIO}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="incident_description"
                name="incident_description"
                label="Description of incident"
                placeholder="Provide a detailed description of the incident"
                component={renderConfig.SCROLL_FIELD}
                validate={[required]}
              />
            </Form.Item>
            <Text>
              <h4>Dangerous Occurrence Determination</h4>
            </Text>
            <Form.Item>
              <Field
                id="mine_determination_type_code"
                name="mine_determination_type_code"
                label="Mine's determination (optional)"
                component={renderConfig.RADIO}
                validate={[validateSelectOptions(this.props.incidentDeterminationOptions)]}
                data={this.props.incidentDeterminationOptions.filter(
                  ({ value }) => value !== Strings.INCIDENT_DETERMINATION_TYPES.pending
                )}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="mine_determination_representative"
                name="mine_determination_representative"
                label="Mine representative who made determination"
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
                  this.props.onFileLoad(
                    document_name,
                    document_manager_guid,
                    Strings.INCIDENT_DOCUMENT_TYPES.initial
                  )
                }
                onRemoveFile={this.props.onRemoveFile}
                mineGuid={this.props.mineGuid}
                component={IncidentFileUpload}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}

AddIncidentDetailForm.propTypes = propTypes;
AddIncidentDetailForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_INCIDENT,
  destroyOnUnmount: false,
  touchOnBlur: true,
  forceUnregisterOnUnmount: true,
})(AddIncidentDetailForm);
