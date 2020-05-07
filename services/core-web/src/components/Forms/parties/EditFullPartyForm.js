import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Col, Row, Button, Popconfirm, Descriptions, Typography } from "antd";
import { isEmpty } from "lodash";
import {
  required,
  email,
  phoneNumber,
  postalCode,
  maxLength,
  number,
} from "@common/utils/Validate";
import { normalizePhone, upperCase, resetForm, formatDateTime } from "@common/utils/helpers";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import PartyOrgBookForm from "@/components/Forms/parties/PartyOrgBookForm";
import { ORGBOOK_ENTITY_URL, ORGBOOK_CREDENTIAL_URL } from "@/constants/routes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  party: CustomPropTypes.party.isRequired,
  closeModal: PropTypes.func.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const { Paragraph, Text } = Typography;

export const EditFullPartyForm = (props) => {
  const isPerson = props.party.party_type_code === "PER";
  const orgBookEntity = props.party.party_orgbook_entity;
  const hasOrgBookEntity = !isEmpty(orgBookEntity);
  return (
    <div>
      <Form onSubmit={props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24} className="border--right--layout">
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <h5>Basic Details</h5>
              </Col>
            </Row>
            {isPerson && (
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
            {!isPerson && (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item>
                    <Field
                      id="party_name"
                      name="party_name"
                      label="Company Name *"
                      component={renderConfig.FIELD}
                      validate={[required]}
                      disabled={hasOrgBookEntity}
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
                    validate={[number, maxLength(6)]}
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
        <Row gutter={48}>
          <Col>
            {(hasOrgBookEntity && (
              <Row>
                <Col>
                  <h5>OrgBook Entity</h5>
                  <Paragraph>
                    <Text>This party has been associated with the following OrgBook entity.</Text>
                    <br />
                    <Text>
                      Association completed by&nbsp;
                      <Text strong>{orgBookEntity.association_user}</Text>
                      &nbsp;on&nbsp;
                      <Text strong>{formatDateTime(orgBookEntity.association_timestamp)}</Text>.
                    </Text>
                  </Paragraph>
                  <Descriptions title="Entity Details" column={1}>
                    <Descriptions.Item label="Registration Name">
                      {orgBookEntity.name_text}
                    </Descriptions.Item>
                    <Descriptions.Item label="Registration ID">
                      <a
                        href={ORGBOOK_ENTITY_URL(orgBookEntity.registration_id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {orgBookEntity.registration_id}
                      </a>
                    </Descriptions.Item>
                    <Descriptions.Item label="Registration Status">
                      {orgBookEntity.registration_status ? "Active" : "Inactive"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Registration Date">
                      {formatDateTime(orgBookEntity.registration_date)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Latest Credential">
                      <a
                        href={ORGBOOK_CREDENTIAL_URL(
                          orgBookEntity.registration_id,
                          orgBookEntity.credential_id
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {orgBookEntity.credential_id}
                      </a>
                    </Descriptions.Item>
                  </Descriptions>
                  <Paragraph>
                    <Text>
                      Information captured on&nbsp;
                      <Text strong>{formatDateTime(orgBookEntity.association_timestamp)}</Text>.
                    </Text>
                  </Paragraph>
                </Col>
              </Row>
            )) ||
              (!isPerson && (
                <AuthorizationWrapper inTesting>
                  <Row>
                    <Col>
                      <h5>OrgBook Entity</h5>
                      <Paragraph>
                        This party has not been associated with an entity on OrgBook. To associate
                        this party with an entity on OrgBook, search for the correct entity using
                        the search below and then select the&nbsp;
                        <Text strong>Associate</Text>
                        &nbsp;button.
                      </Paragraph>
                      <PartyOrgBookForm party={props.party} />
                    </Col>
                  </Row>
                </AuthorizationWrapper>
              ))}
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
            {isPerson ? "Update Person" : "Update Company"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

EditFullPartyForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_FULL_PARTY,
  onSubmitSuccess: resetForm(FORM.EDIT_FULL_PARTY),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(EditFullPartyForm);
