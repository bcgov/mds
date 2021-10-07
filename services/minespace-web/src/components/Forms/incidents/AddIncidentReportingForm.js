import React from "react";
import { Field, reduxForm } from "redux-form";
import { Divider, Col, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import {
  required,
  requiredList,
  email,
  number,
  phoneNumber,
  maxLength,
} from "@common/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";

const { Text } = Typography;

const propTypes = {
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {};

export const AddIncidentReportingForm = (props) => (
  <div>
    <Form layout="vertical">
      <Form.Item label="Incident type(s)">
        <Field
          id="categories"
          name="categories"
          placeholder="Select incident type(s)"
          component={renderConfig.MULTI_SELECT}
          validate={[requiredList]}
          data={props.incidentCategoryCodeOptions}
        />
      </Form.Item>
      <Divider />
      <Text>
        <h4>Reporter Details</h4>
      </Text>
      <Form.Item label="Reported by">
        <Field
          id="reported_by_name"
          name="reported_by_name"
          placeholder="Enter name of reporter"
          component={renderConfig.FIELD}
          validate={[required]}
        />
      </Form.Item>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item label="Phone number (optional)">
            <Field
              id="reported_by_phone_no"
              name="reported_by_phone_no"
              placeholder="xxx-xxx-xxxx"
              component={renderConfig.FIELD}
              validate={[phoneNumber, maxLength(12)]}
              normalize={normalizePhone}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item label="Phone extension (optional)">
            <Field
              id="reported_by_phone_ext"
              name="reported_by_phone_ext"
              placeholder="xxxxxx"
              component={renderConfig.FIELD}
              validate={[number, maxLength(6)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Email address (optional)">
        <Field
          id="reported_by_email"
          name="reported_by_email"
          placeholder="example@domain.com"
          component={renderConfig.FIELD}
          validate={[email]}
        />
      </Form.Item>
    </Form>
  </div>
);

AddIncidentReportingForm.propTypes = propTypes;
AddIncidentReportingForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_INCIDENT,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  touchOnBlur: true,
})(AddIncidentReportingForm);
