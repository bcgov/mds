import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Radio } from "antd";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  number,
  postalCode,
  validateSelectOptions,
} from "@common/utils/Validate";
import { normalizePhone, upperCase, normalizeExt } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  isPerson: PropTypes.bool.isRequired,
  togglePartyChange: PropTypes.func.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const AddFullPartyForm = (props) => (
  <div>
    <Form>
      <Row gutter={48}>
        <Col md={12} sm={24} className="border--right--layout">
          <div className="center margin-large">
            <Radio.Group
              defaultValue
              value={props.isPerson}
              size="large"
              onChange={props.togglePartyChange}
            >
              <Radio.Button value>Person</Radio.Button>
              <Radio.Button value={false}>Organization</Radio.Button>
            </Radio.Group>
          </div>
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <h5>Basic Details</h5>
            </Col>
          </Row>
          {props.isPerson && (
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="first_name"
                    name="first_name"
                    label="First Name *"
                    component={renderConfig.FIELD}
                    validate={[required, maxLength(100)]}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="party_name"
                    name="party_name"
                    label="Surname *"
                    component={renderConfig.FIELD}
                    validate={[required, maxLength(100)]}
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
                    label="Organization Name *"
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
                  label="Primary Email"
                  component={renderConfig.FIELD}
                  validate={[email]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="email_sec"
                  name="email_sec"
                  label="Secondary Email"
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
                  label="Primary Phone No. *"
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
                  normalize={normalizeExt}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item>
                <Field
                  id="phone_no_sec"
                  name="phone_no_sec"
                  label="Secondary Phone No."
                  placeholder="e.g. xxx-xxx-xxxx"
                  component={renderConfig.FIELD}
                  validate={[phoneNumber, maxLength(12)]}
                  normalize={normalizePhone}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Field
                  id="phone_sec_ext"
                  name="phone_sec_ext"
                  label="Ext"
                  component={renderConfig.FIELD}
                  validate={[number, maxLength(6)]}
                  normalize={normalizeExt}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item>
                <Field
                  id="phone_no_ter"
                  name="phone_no_ter"
                  label="Tertiary Phone No."
                  placeholder="e.g. xxx-xxx-xxxx"
                  component={renderConfig.FIELD}
                  validate={[phoneNumber, maxLength(12)]}
                  normalize={normalizePhone}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Field
                  id="phone_ter_ext"
                  name="phone_ter_ext"
                  label="Ext"
                  component={renderConfig.FIELD}
                  validate={[number, maxLength(6)]}
                  normalize={normalizeExt}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col md={12} sm={24} style={{ marginTop: "80px" }}>
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <h5>Address</h5>
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
                  validate={[validateSelectOptions(props.provinceOptions)]}
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
                  validate={[maxLength(10), postalCode]}
                  normalize={upperCase}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  </div>
);

AddFullPartyForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_FULL_PARTY,
  destroyOnUnmount: false,
})(AddFullPartyForm);
