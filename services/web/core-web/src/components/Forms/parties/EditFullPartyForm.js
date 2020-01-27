import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Col, Row, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { required, email, phoneNumber, postalCode, maxLength, number } from "@common/utils/Validate";
import { normalizePhone, upperCase, resetForm } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isPerson: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const EditFullPartyForm = (props) => (
  <div>
    <Form onSubmit={props.handleSubmit}>
      <Row gutter={48}>
        <Col md={12} sm={24} className="border--right--layout">
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
                    validate={[required]}
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
                    label="Company Name *"
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
                  label="Phone No. *"
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
                  validate={[number, maxLength(4)]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col md={12} sm={24}>
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
                  format={null}
                  component={renderConfig.SELECT}
                  data={[{ label: "None", value: null }, ...props.provinceOptions]}
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
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile">Cancel</Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit">
          {props.isPerson ? "Update Personnel" : "Update Company"}
        </Button>
      </div>
    </Form>
  </div>
);

EditFullPartyForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_FULL_PARTY,
  onSubmitSuccess: resetForm(FORM.EDIT_FULL_PARTY),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(EditFullPartyForm);
