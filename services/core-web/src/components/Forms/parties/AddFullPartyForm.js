import React from "react";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { Col, Row, Radio } from "antd";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  number,
  postalCodeWithCountry,
} from "@mds/common/redux/utils/Validate";
import { normalizePhone, upperCase, normalizeExt } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { useSelector } from "react-redux";

const propTypes = {
  isPerson: PropTypes.bool.isRequired,
  togglePartyChange: PropTypes.func.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const AddFullPartyForm = (props) => {
  const { sub_division_code } = useSelector(getFormValues(FORM.ADD_FULL_PARTY)) ?? {};
  const province = props.provinceOptions.find((prov) => prov.value === sub_division_code);
  const address_type_code = province?.subType;
  return (
    <div>
      <FormWrapper
        onSubmit={() => { }}
        name={FORM.ADD_FULL_PARTY}
        reduxFormConfig={{ destroyOnUnmount: false }}
        isModal
      >
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
                  <Field
                    id="first_name"
                    name="first_name"
                    label="First Name"
                    component={renderConfig.FIELD}
                    required
                    validate={[required, maxLength(100)]}
                  />
                </Col>
                <Col md={12} xs={24}>
                  <Field
                    id="party_name"
                    name="party_name"
                    label="Surname"
                    component={renderConfig.FIELD}
                    required
                    validate={[required, maxLength(100)]}
                  />
                </Col>
              </Row>
            )}
            {!props.isPerson && (
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    id="party_name"
                    name="party_name"
                    label="Organization Name"
                    component={renderConfig.FIELD}
                    required
                    validate={[required]}
                  />
                </Col>
              </Row>
            )}
            <Row gutter={16}>
              <Col span={24}>
                <Field
                  id="email"
                  name="email"
                  label="Primary Email"
                  component={renderConfig.FIELD}
                  validate={[email]}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Field
                  id="email_sec"
                  name="email_sec"
                  label="Secondary Email"
                  component={renderConfig.FIELD}
                  validate={[email]}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={18}>
                <Field
                  id="phone_no"
                  name="phone_no"
                  label="Primary Phone No."
                  placeholder="e.g. xxx-xxx-xxxx"
                  component={renderConfig.FIELD}
                  required
                  validate={[required, phoneNumber, maxLength(12)]}
                  normalize={normalizePhone}
                />
              </Col>
              <Col span={6}>
                <Field
                  id="phone_ext"
                  name="phone_ext"
                  label="Ext"
                  component={renderConfig.FIELD}
                  validate={[number, maxLength(6)]}
                  normalize={normalizeExt}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={18}>
                <Field
                  id="phone_no_sec"
                  name="phone_no_sec"
                  label="Secondary Phone No."
                  placeholder="e.g. xxx-xxx-xxxx"
                  component={renderConfig.FIELD}
                  validate={[phoneNumber, maxLength(12)]}
                  normalize={normalizePhone}
                />
              </Col>
              <Col span={6}>
                <Field
                  id="phone_sec_ext"
                  name="phone_sec_ext"
                  label="Ext"
                  component={renderConfig.FIELD}
                  validate={[number, maxLength(6)]}
                  normalize={normalizeExt}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={18}>
                <Field
                  id="phone_no_ter"
                  name="phone_no_ter"
                  label="Tertiary Phone No."
                  placeholder="e.g. xxx-xxx-xxxx"
                  component={renderConfig.FIELD}
                  validate={[phoneNumber, maxLength(12)]}
                  normalize={normalizePhone}
                />
              </Col>
              <Col span={6}>
                <Field
                  id="phone_ter_ext"
                  name="phone_ter_ext"
                  label="Ext"
                  component={renderConfig.FIELD}
                  validate={[number, maxLength(6)]}
                  normalize={normalizeExt}
                />
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
                <Field
                  id="suite_no"
                  name="suite_no"
                  label="Suite No."
                  component={renderConfig.FIELD}
                  validate={[maxLength(10)]}
                />
              </Col>
              <Col span={18}>
                <Field
                  id="address_line_1"
                  name="address_line_1"
                  label="Street Address 1"
                  component={renderConfig.FIELD}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={18}>
                <Field
                  id="address_line_2"
                  name="address_line_2"
                  label="Street Address 2"
                  component={renderConfig.FIELD}
                />
              </Col>
              <Col span={6}>
                <Field
                  id="sub_division_code"
                  name="sub_division_code"
                  label="Province"
                  component={renderConfig.SELECT}
                  data={props.provinceOptions}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Field
                  id="city"
                  name="city"
                  label="City"
                  component={renderConfig.FIELD}
                  validate={[maxLength(30)]}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="post_code"
                  name="post_code"
                  label="Postal Code"
                  placeholder="e.g xxxxxx"
                  component={renderConfig.FIELD}
                  validate={[maxLength(10), postalCodeWithCountry(address_type_code)]}
                  normalize={upperCase}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </FormWrapper>
    </div>
  )
};

AddFullPartyForm.propTypes = propTypes;

export default AddFullPartyForm;
