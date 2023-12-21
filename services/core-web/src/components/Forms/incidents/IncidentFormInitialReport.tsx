import { Col, Divider, Form, Row, Typography } from "antd";
import React, { FC } from "react";
import { Field } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { useSelector } from "react-redux";
import {
  dateNotInFutureTZ,
  dateTimezoneRequired,
  email,
  maxLength,
  number,
  phoneNumber,
  required,
  requiredList,
  requiredNotUndefined,
  wholeNumber,
} from "@common/utils/Validate";
import { normalizeDatetime, normalizePhone } from "@common/utils/helpers";
import IncidentCategoryCheckboxGroup from "@/components/Forms/incidents/IncidentCategoryCheckboxGroup";
import RenderDateTimeTz from "@/components/common/RenderDateTimeTz";
import { getDropdownIncidentCategoryCodeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { IMineIncident } from "@mds/common";

interface IncidentFormInitialReportProps {
  isEditMode: boolean;
  incident: IMineIncident;
}

const IncidentFormInitialReport: FC<IncidentFormInitialReportProps> = ({
  isEditMode,
  incident,
}) => {
  const showUnspecified = incident.mine_incident_guid && !incident.incident_location;

  const locationOptions = [
    { label: "Surface", value: "surface" },
    {
      label: "Underground",
      value: "underground",
    },
    ...(showUnspecified ? [{ label: "Not Specified", value: "" }] : []),
  ];

  const incidentCategoryCodeOptions = useSelector(getDropdownIncidentCategoryCodeOptions);

  return (
    <div className="ant-form-vertical">
      <Row>
        {/* Reporter Details */}
        <Col span={24}>
          <Typography.Title level={3} id="initial-report">
            Initial Report
          </Typography.Title>
          <h4>Reporter Details</h4>
          <Typography.Paragraph>
            Enter all available details about the reporter of this incident.
          </Typography.Paragraph>
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item label="* Reported by">
                <Field
                  id="reported_by_name"
                  name="reported_by_name"
                  placeholder="Enter name of reporter..."
                  component={renderConfig.FIELD}
                  validate={[required]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item label="* Phone number">
                <Field
                  id="reported_by_phone_no"
                  name="reported_by_phone_no"
                  placeholder="xxx-xxx-xxxx"
                  component={renderConfig.FIELD}
                  validate={[required, phoneNumber, maxLength(12)]}
                  normalize={normalizePhone}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Ext.">
                <Field
                  id="reported_by_phone_ext"
                  name="reported_by_phone_ext"
                  placeholder="xxxxxx"
                  component={renderConfig.FIELD}
                  validate={[number, maxLength(6)]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col md={10} xs={24}>
              <Form.Item label="* Email">
                <Field
                  id="reported_by_email"
                  name="reported_by_email"
                  placeholder="example@domain.com"
                  component={renderConfig.FIELD}
                  validate={[required, email]}
                  disabled={!isEditMode}
                  blockLabelText={
                    "Notification of record creation and updates will be sent to this address"
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <br />
        </Col>
        {/* Incident Details */}
        <Col span={24}>
          <h4 id="incident-details">Incident Details</h4>
          <Typography.Paragraph>
            Enter more information regarding the reported incident. Some fields may be marked as
            optional but help the ministry understand the nature of the incident, please consider
            including them.
          </Typography.Paragraph>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="* Incident Location">
                <Field
                  id="incident_location"
                  name="incident_location"
                  disabled={!isEditMode}
                  component={renderConfig.RADIO}
                  validate={[requiredNotUndefined]}
                  customOptions={locationOptions}
                />
              </Form.Item>
              <Form.Item label="* Incident Category and Subcategory">
                <Field
                  id="categories"
                  name="categories"
                  component={IncidentCategoryCheckboxGroup}
                  validate={[requiredList]}
                  data={incidentCategoryCodeOptions}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="* Incident date & time">
                <Field
                  id="incident_timestamp"
                  name="incident_timestamp"
                  disabled={!isEditMode}
                  normalize={normalizeDatetime}
                  validate={[
                    dateNotInFutureTZ,
                    required,
                    dateTimezoneRequired("incident_timezone"),
                  ]}
                  props={{ timezoneFieldProps: { name: "incident_timezone" } }}
                  component={RenderDateTimeTz}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Proponent incident number (optional)">
                <Field
                  id="proponent_incident_no"
                  name="proponent_incident_no"
                  component={renderConfig.FIELD}
                  validate={[maxLength(20)]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Number of injuries (optional)">
                <Field
                  id="number_of_injuries"
                  name="number_of_injuries"
                  component={renderConfig.FIELD}
                  validate={[wholeNumber, maxLength(10)]}
                  disabled={!isEditMode}
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
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Were emergency services called? (optional)">
                <Field
                  id="emergency_services_called"
                  name="emergency_services_called"
                  component={renderConfig.RADIO}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="* Description of incident">
                <Field
                  id="incident_description"
                  name="incident_description"
                  placeholder="Provide a detailed description of the incident..."
                  component={renderConfig.SCROLL_FIELD}
                  validate={[required, maxLength(4000)]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Immediate measures taken (optional)">
                <Field
                  id="immediate_measures_taken"
                  name="immediate_measures_taken"
                  placeholder="Provide a detailed description of any immediate measures taken..."
                  component={renderConfig.SCROLL_FIELD}
                  validate={[maxLength(4000)]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="If any injuries, please describe (optional)">
                <Field
                  id="injuries_description"
                  name="injuries_description"
                  placeholder="Provide a detailed description of any injuries..."
                  component={renderConfig.SCROLL_FIELD}
                  validate={[maxLength(4000)]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Divider />
            <Col md={12} xs={24}>
              <Form.Item label="JOHSC/Worker Rep Name (optional)">
                <Field
                  id="johsc_worker_rep_name"
                  name="johsc_worker_rep_name"
                  component={renderConfig.FIELD}
                  placeholder="Enter name of representative..."
                  validate={[maxLength(100)]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Was this person contacted? (optional)">
                <Field
                  id="johsc_worker_rep_contacted"
                  name="johsc_worker_rep_contacted"
                  component={renderConfig.RADIO}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="JOHSC/Management Rep Name (optional)">
                <Field
                  id="johsc_management_rep_name"
                  name="johsc_management_rep_name"
                  component={renderConfig.FIELD}
                  placeholder="Enter name of representative..."
                  validate={[maxLength(100)]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item label="Was this person contacted? (optional)">
                <Field
                  id="johsc_management_rep_contacted"
                  name="johsc_management_rep_contacted"
                  component={renderConfig.RADIO}
                  disabled={!isEditMode}
                />
              </Form.Item>
              <br />
            </Col>
          </Row>
          <br />
        </Col>
      </Row>
    </div>
  );
};

export default IncidentFormInitialReport;
