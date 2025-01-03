import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Divider, Row, Typography, Form } from "antd";
import {
  required,
  maxLength,
  wholeNumber,
  dateNotInFuture,
} from "@mds/common/redux/utils/Validate";
import * as Strings from "@mds/common/constants/strings";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import IncidentFileUpload from "./IncidentFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

const defaultProps = {};

export const AddIncidentDetailForm = (props) => {
  return (
    <FormWrapper
      name={FORM.ADD_INCIDENT}
      onSubmit={() => {}}
      reduxFormConfig={{
        destroyOnUnmount: false,
        touchOnBlur: true,
        forceUnregisterOnUnmount: true,
      }}
    >
      <Row gutter={48}>
        <Col span={24}>
          <Typography.Text>
            <h4>Incident Details</h4>
          </Typography.Text>
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                label="Incident date"
                id="incident_date"
                name="incident_date"
                placeholder="Please select date"
                component={renderConfig.DATE}
                required
                validate={[required, dateNotInFuture]}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                label="Incident time"
                id="incident_time"
                name="incident_time"
                placeholder="Please select time"
                component={renderConfig.TIME}
                required
                validate={[required]}
                fullWidth
              />
            </Col>
          </Row>
          <Field
            label="Proponent incident number"
            id="proponent_incident_no"
            name="proponent_incident_no"
            component={renderConfig.FIELD}
            validate={[maxLength(20)]}
          />
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                label="Proponent incident number"
                id="number_of_injuries"
                name="number_of_injuries"
                component={renderConfig.FIELD}
                validate={[wholeNumber, maxLength(10)]}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                label="Number of fatalities"
                id="number_of_fatalities"
                name="number_of_fatalities"
                component={renderConfig.FIELD}
                validate={[wholeNumber, maxLength(10)]}
              />
            </Col>
          </Row>
          <Field
            label="Were emergency services called?"
            id="emergency_services_called"
            name="emergency_services_called"
            placeholder="Please choose one"
            component={renderConfig.RADIO}
          />
          <Field
            label="Description of incident"
            id="incident_description"
            name="incident_description"
            placeholder="Provide a detailed description of the incident"
            component={renderConfig.SCROLL_FIELD}
            required
            validate={[required]}
          />
          <Divider />
          <Typography.Text>
            <h4>Dangerous Occurrence Determination</h4>
          </Typography.Text>
          <Field
            label="Is this a dangerous occurrence?"
            id="mine_determination_type_code"
            name="mine_determination_type_code"
            component={renderConfig.RADIO}
          />
          <Field
            label="Mine representative who made determination"
            id="mine_determination_representative"
            name="mine_determination_representative"
            component={renderConfig.FIELD}
            validate={[maxLength(255)]}
          />
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
    </FormWrapper>
  );
};

AddIncidentDetailForm.propTypes = propTypes;
AddIncidentDetailForm.defaultProps = defaultProps;

export default AddIncidentDetailForm;
