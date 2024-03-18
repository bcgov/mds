import React, { FC, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isNil } from "lodash";
import { Typography, Button, Row, Col, Popconfirm } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Field, FieldArray, arrayPush, getFormValues, change } from "redux-form";
import {
  maxLength,
  phoneNumber,
  required,
  email,
  postalCodeWithCountry,
} from "@mds/common/redux/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import * as FORM from "@/constants/forms";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import { CONTACTS_COUNTRY_OPTIONS } from "@mds/common";

import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";

const RenderContacts = (props) => {
  const { fields, contacts } = props;
  const dispatch = useDispatch();
  const provinceOptions = useSelector(getDropdownProvinceOptions);
  const handleClearProvince = (currentCountry, addressTypeCode, subDivisionCode, field) => {
    // clear out the province if country has changed and it no longer matches
    if (addressTypeCode !== currentCountry) {
      const selectedProvince = currentCountry
        ? provinceOptions.find((p) => p.value === subDivisionCode)
        : {};

      const contactFieldToBeChanged = `${field}.address.sub_division_code`;
      if (addressTypeCode === "INT" || selectedProvince?.subType !== currentCountry) {
        dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, contactFieldToBeChanged, null));
      }
    }
  };

  return (
    <>
      {fields.map((field, index) => {
        const { address = {} } = contacts[index] ?? {};
        const { address_type_code, sub_division_code } = address ?? {};
        const isInternational = address_type_code === "INT";
        const isPrimary = contacts[index].is_primary;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            {index === 0 ? (
              <>
                <Typography.Title level={5}>Primary project contact</Typography.Title>
                <Typography.Paragraph>
                  Provide contact information for the person who has the main responsibility for
                  coordinating this project.
                </Typography.Paragraph>
              </>
            ) : (
              <>
                <Row gutter={16}>
                  <Col span={10}>
                    <Typography.Title level={5}>
                      Additional project contact #{index}
                    </Typography.Title>
                  </Col>
                  <Col span={12}>
                    <Popconfirm
                      placement="topLeft"
                      title="Are you sure you want to remove this contact?"
                      onConfirm={() => fields.remove(index)}
                      okText="Remove"
                      cancelText="Cancel"
                    >
                      <Button type="primary" size="small" ghost>
                        <DeleteOutlined className="padding-sm--left icon-sm" />
                      </Button>
                    </Popconfirm>
                  </Col>
                </Row>
              </>
            )}
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.first_name`}
                  label="First Name"
                  component={RenderField}
                  required
                  validate={[required, maxLength(100)]}
                />
              </Col>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.last_name`}
                  label="Last Name"
                  component={RenderField}
                  required
                  validate={[required, maxLength(100)]}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.job_title`}
                  id={`${field}.job_title`}
                  label="Job Title"
                  component={RenderField}
                />
              </Col>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.company_name`}
                  id={`${field}.company_name`}
                  label="Company name"
                  component={RenderField}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col md={8} sm={19}>
                <Field
                  name={`${field}.phone_number`}
                  id={`${field}.phone_number`}
                  label="Contact Number"
                  required
                  component={RenderField}
                  validate={[phoneNumber, maxLength(12), required]}
                  normalize={normalizePhone}
                />
              </Col>
              <Col md={4} sm={5}>
                <Field
                  name={`${field}.phone_extension`}
                  id={`${field}.phone_extension`}
                  label="Ext."
                  component={RenderField}
                  validate={[maxLength(6)]}
                />
              </Col>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.email`}
                  id={`${field}.email`}
                  label="Email"
                  required
                  component={RenderField}
                  validate={[required, email]}
                />
              </Col>
            </Row>

            <Typography.Title level={5}>Mailing Address</Typography.Title>
            <Row gutter={16}>
              <Col md={19} sm={24}>
                <Field
                  name={`${field}.address.address_line_1`}
                  label="Street"
                  required={isPrimary}
                  validate={isPrimary ? [required] : []}
                  component={RenderField}
                />
              </Col>
              <Col md={5} sm={24}>
                <Field name={`${field}.address.suite_no`} label="Unit #" component={RenderField} />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.address.address_type_code`}
                  label="Country"
                  required={isPrimary}
                  validate={isPrimary ? [required] : []}
                  data={CONTACTS_COUNTRY_OPTIONS}
                  component={RenderSelect}
                  onSelect={(e) =>
                    handleClearProvince(e, address_type_code, sub_division_code, field)
                  }
                />
              </Col>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.address.sub_division_code`}
                  label="Province"
                  required={isPrimary && !isInternational}
                  data={provinceOptions.filter((p) => p.subType === address_type_code)}
                  validate={!isInternational && isPrimary ? [required] : []}
                  component={RenderSelect}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.address.city`}
                  label="City"
                  required={isPrimary}
                  validate={isPrimary ? [required] : []}
                  component={RenderField}
                />
              </Col>
              <Col md={12} sm={24}>
                <Field
                  name={`${field}.address.post_code`}
                  label="Postal Code"
                  component={RenderField}
                  required={isPrimary}
                  validate={[postalCodeWithCountry(address_type_code), maxLength(10)]}
                />
              </Col>
            </Row>

            {index === 0 && (
              <>
                <Typography.Title level={3}>
                  Additional project contacts (optional)
                </Typography.Title>
                <Typography.Paragraph>
                  Provide contact information for additional people we can contact about this
                  project.
                </Typography.Paragraph>
              </>
            )}
          </div>
        );
      })}
      <LinkButton
        onClick={() => fields.push({ is_primary: false })}
        title="Add additional project contacts"
      >
        <PlusOutlined /> Add additional project contacts
      </LinkButton>
    </>
  );
};

export const ProjectContacts: FC = () => {
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { contacts } = formValues;

  useEffect(() => {
    if (isNil(contacts) || contacts.length === 0) {
      dispatch(arrayPush(FORM.ADD_EDIT_PROJECT_SUMMARY, "contacts", { is_primary: true }));
    }
  }, []);

  return (
    <>
      <Typography.Title level={3}>Project Contacts</Typography.Title>
      <FieldArray name="contacts" contacts={contacts} component={RenderContacts} />
    </>
  );
};

export default ProjectContacts;
