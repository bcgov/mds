import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Collapse, Button, Icon, Popconfirm, Form, Col, Row, Radio } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { required, email, phoneNumber, maxLength, number } from "@/utils/Validate";
import { normalizePhone, upperCase } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  togglePartyChange: PropTypes.func.isRequired,
  isPerson: PropTypes.bool.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const panelHeader = () => (
  <div className="inline-flex between">
    <Form.Item style={{ marginTop: "15px" }} label="Role 1" />
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
    <div onClick={(event) => event.stopPropagation()}>
      <Popconfirm
        placement="topRight"
        // title={`Are you sure you want to remove Mine Type ${index + 1}?`}
        // onConfirm={(event) => { this.removeField(event, fields, index); }}
        okText="Yes"
        cancelText="No"
      >
        <Button ghost>
          <Icon type="minus-circle" theme="outlined" style={{ color: "#BC2929" }} />
        </Button>
      </Popconfirm>
    </div>
  </div>
);

export const AddRolesForm = (props) => (
  <div>
    <Form>
      <Collapse.Panel header={panelHeader()}>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              // usedOptions={this.state.usedTenureTypes}
              // id={`${type}.mine_tenure_type_code`}
              // name={`${type}.mine_tenure_type_code`}
              label="Tenure"
              placeholder="Please Select Tenure"
              component={renderConfig.SELECT}
              data={[{ value: "hi", label: "Hi There" }]}
            />
          </Col>
        </Row>
      </Collapse.Panel>
      <Button
        className="btn--dropdown"
        // onClick={(event) => this.addField(event, fields)}
      >
        <Icon type="plus" style={{ color: "#000" }} />
        {Math.random() > 0.5 ? "Add Role" : "Add Another Role"}
      </Button>

      <Row gutter={48}>
        <Col md={12} sm={24} className="border--right--violet">
          <div className="center margin-large">
            <Radio.Group defaultValue size="large" onChange={props.togglePartyChange}>
              <Radio.Button value>Person</Radio.Button>
              <Radio.Button value={false}>Company</Radio.Button>
            </Radio.Group>
          </div>
          <Row gutter={16}>
            <h5>Basic Details</h5>
          </Row>
          {props.isPerson && (
            <Row gutter={16}>
              <Col md={12} sm={12} xs={24}>
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
              <Col md={12} sm={12} xs={24}>
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
        <Col md={12} sm={24} style={{ marginTop: "80px" }}>
          <Row gutter={16}>
            <h5>Address</h5>
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
            <Col md={12} sm={12} xs={24}>
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
            <Col md={12} sm={12} xs={24}>
              <Form.Item>
                <Field
                  id="post_code"
                  name="post_code"
                  label="Postal Code"
                  placeholder="e.g xxxxxx"
                  component={renderConfig.FIELD}
                  validate={[maxLength(6)]}
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

AddRolesForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_FULL_PARTY,
  destroyOnUnmount: false,
})(AddRolesForm);
