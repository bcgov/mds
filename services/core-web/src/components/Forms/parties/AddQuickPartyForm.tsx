import React, { FC, useEffect } from "react";
import { Field, getFormValues, isSubmitting, change } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Row } from "antd";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  number,
  postalCodeWithCountry,
} from "@mds/common/redux/utils/Validate";
import { resetForm, normalizePhone, upperCase } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

interface AddQuickPartyFormProps {
  onSubmit: (values) => void | Promise<void>;
  isPerson: boolean;
  provinceOptions: any[];
  initialValues?: any;
}

const AddQuickPartyForm: FC<AddQuickPartyFormProps> = (props) => {
  const dispatch = useDispatch();
  const submitting = useSelector(isSubmitting(FORM.ADD_QUICK_PARTY));
  const formValues = useSelector(getFormValues(FORM.ADD_QUICK_PARTY));
  const { sub_division_code = "", address_type_code = "" } = formValues ?? {};

  useEffect(() => {
    const provinceOption = props.provinceOptions.find((prov) => prov.value === sub_division_code);
    dispatch(change(FORM.ADD_QUICK_PARTY, "address_type_code", provinceOption?.subType));
  }, [sub_division_code]);

  return (
    <div>
      <FormWrapper
        name={FORM.ADD_QUICK_PARTY}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        reduxFormConfig={{
          touchOnBlur: false,
          onSubmitSuccess: resetForm(FORM.ADD_QUICK_PARTY),
        }}
      >
        {props.isPerson && (
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                id="first_name"
                name="first_name"
                label="First Name"
                component={renderConfig.FIELD}
                required
                validate={[required]}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="party_name"
                name="party_name"
                label="Surname"
                component={renderConfig.FIELD}
                required
                validate={[required]}
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
              label="Primary Phone Number"
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
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={18}>
            <Field
              id="phone_no_sec"
              name="phone_no_sec"
              label="Secondary Phone Number"
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
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={18}>
            <Field
              id="phone_no_ter"
              name="phone_no_ter"
              label="Tertiary Phone Number"
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
            />
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
        <div className="right center-mobile">
          <Button className="full-mobile" type="primary" htmlType="submit" loading={submitting}>
            {props.isPerson ? "Create Person" : "Create Organization"}
          </Button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default AddQuickPartyForm;
