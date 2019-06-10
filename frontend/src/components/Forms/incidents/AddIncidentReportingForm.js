import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { required, email, number, phoneNumber, maxLength, dateNotInFuture } from "@/utils/Validate";
import { normalizePhone } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import CustomPropTypes from "@/customPropTypes";
// import { resetForm } from "@/utils/helpers";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectors: CustomPropTypes.options.isRequired,
};

export const AddIncidentReportingForm = (props) => (
  <div>
    <Form layout="vertical">
      <Row gutter={48}>
        <Col>
          <Form.Item>
            <Field
              id="mine_incident_id_year+mine_incident_report_no"
              name="mine_incident_id_year+mine_incident_report_no"
              label="Ministry Incident No."
              placeholder="2019-0026"
              component={RenderField}
              data={props.initialValues.incident}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="reported_to_inspector_party_guid"
              name="reported_to_inspector_party_guid"
              label="Incident reported to*:"
              component={renderConfig.SELECT}
              validate={[required]}
              data={props.inspectors}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="responsible_inspector_party_guid"
              name="responsible_inspector_party_guid"
              label="Inspector responsible:*"
              component={renderConfig.SELECT}
              validate={[required]}
              data={props.inspectors}
            />
          </Form.Item>
          <h4>Reporter Details</h4>
          <Form.Item>
            <Field
              id="reported_by_name"
              name="reported_by_name"
              label="Reported by"
              placeholder="Text"
              component={RenderField}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="reported_by_phone_no"
              name="reported_by_phone_no"
              label="Phone number"
              placeholder="Phone format"
              component={RenderField}
              validate={[phoneNumber, maxLength(12)]}
              normalize={normalizePhone}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="reported_by_phone_ext"
              name="reported_by_phone_ext"
              label="Phone extension"
              placeholder="Phone format"
              component={RenderField}
              validate={[number, maxLength(4)]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="reported_by_email"
              name="reported_by_email"
              label="Email"
              placeholder="email format"
              component={RenderField}
              validate={[email]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="reported_timestamp"
              name="reported_timestamp"
              label="Reported Date and Time"
              placeholder="Please select date and time"
              component={RenderDate}
              validate={[required, dateNotInFuture]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </div>
);

AddIncidentReportingForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_INCIDENT_REPORTING,
  destroyOnUnmount: false,
})(AddIncidentReportingForm);
