import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Button, Popconfirm, Descriptions, Typography, Divider } from "antd";
import { isEmpty } from "lodash";
import {
  required,
  email,
  phoneNumber,
  postalCode,
  maxLength,
  number,
  validateSelectOptions,
} from "@common/utils/Validate";
import { normalizePhone, upperCase, resetForm, formatDateTime } from "@common/utils/helpers";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import PartyOrgBookForm from "@/components/Forms/parties/PartyOrgBookForm";
import { ORGBOOK_ENTITY_URL, ORGBOOK_CREDENTIAL_URL } from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import PartySignatureUpload from "./PartySignatureUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  party: CustomPropTypes.party.isRequired,
  closeModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  orgBookEntity: PropTypes.objectOf(PropTypes.string).isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export class EditFullPartyForm extends Component {
  state = {
    signature: null,
  };

  onChangeSignature = (signatureBase64) => {
    this.setState({
      signature: signatureBase64,
    });
  };

  render = () => {
    const isPerson = this.props.party.party_type_code === "PER";
    const orgBookEntity = this.props.party.party_orgbook_entity;
    const hasOrgBookEntity = !isEmpty(this.props.orgBookEntity);
    return (
      <div>
        <Form
          onSubmit={this.props.handleSubmit((values) => {
            const party = {
              ...values,
              signature: this.state.signature,
            };
            return this.props.onSubmit(party);
          })}
        >
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
                      validate={[validateSelectOptions(this.props.provinceOptions)]}
                      component={renderConfig.SELECT}
                      data={[{ label: "None", value: null }, ...this.props.provinceOptions]}
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
          <Row gutter={48}>
            <Col span={24}>
              {(hasOrgBookEntity && (
                <Row>
                  <Col span={24}>
                    <h5>OrgBook Entity</h5>
                    <Typography.Paragraph>
                      <Typography.Text>
                        This party has been associated with the following OrgBook entity.
                      </Typography.Text>
                      <br />
                      <Typography.Text>
                        Association completed by&nbsp;
                        <Typography.Text strong>{orgBookEntity.association_user}</Typography.Text>
                        &nbsp;on&nbsp;
                        <Typography.Text strong>
                          {formatDateTime(orgBookEntity.association_timestamp)}
                        </Typography.Text>
                        .
                      </Typography.Text>
                    </Typography.Paragraph>
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
                    <Typography.Paragraph>
                      <Typography.Text>
                        Information captured on&nbsp;
                        <Typography.Text strong>
                          {formatDateTime(orgBookEntity.association_timestamp)}
                        </Typography.Text>
                        .
                      </Typography.Text>
                    </Typography.Paragraph>
                  </Col>
                </Row>
              )) ||
                (!isPerson && (
                  <AuthorizationWrapper permission={Permission.ADMIN}>
                    <Row>
                      <Col span={24}>
                        <h5>OrgBook Entity</h5>
                        <Typography.Paragraph>
                          This party has not been associated with an entity on OrgBook. To associate
                          this party with an entity on OrgBook, search for the correct entity using
                          the search below and then select the&nbsp;
                          <Typography.Text strong>Associate</Typography.Text>
                          &nbsp;button.
                        </Typography.Paragraph>
                        <PartyOrgBookForm party={this.props.party} />
                      </Col>
                    </Row>
                  </AuthorizationWrapper>
                ))}
            </Col>
          </Row>
          {isPerson && (
            <>
              <br />
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Divider />
                <Row gutter={16}>
                  <Col span={24}>
                    <h5>Assign Inspector Role</h5>
                  </Col>
                </Row>
                <Row>
                  <p>
                    By setting this checkbox you grant inspector role to this party. Please note
                    that removing this checkbox will not delete party from associated entities.
                  </p>
                  <Col md={12} sm={24}>
                    <Field
                      id="set_to_inspector"
                      name="set_to_inspector"
                      label="Set to inspector"
                      type="checkbox"
                      component={renderConfig.CHECKBOX}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Field
                      label="Start Date"
                      id="inspector_start_date"
                      name="inspector_start_date"
                      placeholder="yyyy-mm-dd"
                      component={renderConfig.DATE}
                    />
                  </Col>
                  <Col span={12}>
                    <Field
                      label="End Date"
                      id="inspector_end_date"
                      name="inspector_end_date"
                      placeholder="yyyy-mm-dd"
                      component={renderConfig.DATE}
                    />
                  </Col>
                </Row>
                <br />
                <Divider />
                <Row gutter={16}>
                  <Col span={24}>
                    <h5>Upload Signature</h5>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Field
                      id="PartySignatureUpload"
                      name="PartySignatureUpload"
                      component={PartySignatureUpload}
                      onFileChange={this.onChangeSignature}
                      onRemove={this.onDeleteSignature}
                      signature={this.props.party.signature}
                    />
                  </Col>
                </Row>
              </AuthorizationWrapper>
            </>
          )}
          <div className="right center-mobile">
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to cancel?"
              onConfirm={this.props.closeModal}
              okText="Yes"
              cancelText="No"
              disabled={this.props.submitting}
            >
              <Button className="full-mobile" disabled={this.props.submitting}>
                Cancel
              </Button>
            </Popconfirm>
            <Button
              className="full-mobile"
              type="primary"
              htmlType="submit"
              loading={this.props.submitting}
            >
              {isPerson ? "Update Person" : "Update Company"}
            </Button>
          </div>
        </Form>
      </div>
    );
  };
}

EditFullPartyForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_FULL_PARTY,
  onSubmitSuccess: resetForm(FORM.EDIT_FULL_PARTY),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(EditFullPartyForm);
