import React from "react";
// import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
// import { required, email, phoneNumber, maxLength, number, postalCode } from "@/utils/Validate";
// import { normalizePhone, upperCase } from "@/utils/helpers";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import { required, dateNotInFuture } from "@/utils/Validate";
// import { resetForm } from "@/utils/helpers";

// const propTypes = {
//   fol: PropTypes.bool.isRequired,
// };

export const AddIncidentReportingForm = () => (
  <div>
    <Form layout="vertical">
      <Row gutter={48}>
        <Col>
          <Form.Item>
            <Field
              id="incident_no"
              name="incident_no"
              label="Ministry Incident No."
              placeholder="2019-0026"
              component={RenderField}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="reported_to"
              name="reported_to"
              label="Incident reported to*:"
              placeholder="Typeahead"
              component={RenderField}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="inspector_responsible"
              name="inspector_responsible"
              label="Inspector responsible:"
              placeholder="Typeahead"
              component={RenderField}
              validate={[required]}
            />
          </Form.Item>
          <h4>Reporter Details</h4>
          <Form.Item>
            <Field
              id="reported_by"
              name="reported_by"
              label="Reported by"
              placeholder="Text"
              component={RenderField}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="phone_number"
              name="phone_number"
              label="Phone number"
              placeholder="Phone format"
              component={RenderField}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="email"
              name="email"
              label="Email"
              placeholder="email format"
              component={RenderField}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="reported_timestamp"
              name="reported_timestamp"
              label="Reported Date and Time"
              placeholder="Please select date and time"
              component={RenderDate}
              showTime
              validate={[required, dateNotInFuture]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </div>
);

// AddIncidentReportingForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_INCIDENT_REPORTING,
  destroyOnUnmount: false,
})(AddIncidentReportingForm);
