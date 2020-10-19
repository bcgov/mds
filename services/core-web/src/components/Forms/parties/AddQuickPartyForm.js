import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  number,
  postalCode,
} from "@common/utils/Validate";
import { resetForm, normalizePhone, upperCase } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isPerson: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const AddQuickPartyForm = (props) => (
  <div>
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      {props.isPerson && (
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="first_name"
                name="first_name"
                label="First Name*"
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="party_name"
                name="party_name"
                label="Surname*"
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
      )}
      {!props.isPerson && (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="party_name"
                name="party_name"
                label="Company Name*"
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="email"
              name="email"
              label="Email"
              component={renderConfig.FIELD}
              validate={[email]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={18}>
          <Form.Item>
            <Field
              id="phone_no"
              name="phone_no"
              label="Phone Number*"
              placeholder="e.g. xxx-xxx-xxxx"
              component={renderConfig.FIELD}
              validate={[required, phoneNumber, maxLength(12)]}
              normalize={normalizePhone}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item>
            <Field
              id="phone_ext"
              name="phone_ext"
              label="Ext"
              component={renderConfig.FIELD}
              validate={[number, maxLength(6)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item>
            <Field
              id="suite_no"
              name="suite_no"
              label="Suite No."
              component={renderConfig.FIELD}
              validate={[maxLength(10)]}
            />
          </Form.Item>
        </Col>
        <Col span={18}>
          <Form.Item>
            <Field
              id="address_line_1"
              name="address_line_1"
              label="Street Address 1"
              component={renderConfig.FIELD}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={18}>
          <Form.Item>
            <Field
              id="address_line_2"
              name="address_line_2"
              label="Street Address 2"
              component={renderConfig.FIELD}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item>
            <Field
              id="sub_division_code"
              name="sub_division_code"
              label="Province"
              component={renderConfig.SELECT}
              data={props.provinceOptions}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="city"
              name="city"
              label="City"
              component={renderConfig.FIELD}
              validate={[maxLength(30)]}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="post_code"
              name="post_code"
              label="Postal Code"
              placeholder="e.g xxxxxx"
              component={renderConfig.FIELD}
              validate={[maxLength(6), postalCode]}
              normalize={upperCase}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
          {props.isPerson ? "Create Person" : "Create Company"}
        </Button>
      </div>
    </Form>
  </div>
);

AddQuickPartyForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_QUICK_PARTY,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_QUICK_PARTY),
})(AddQuickPartyForm);
