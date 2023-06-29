import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, FormSection } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Alert } from "antd";
import CoreTable from "@/components/common/CoreTable";
import { formatDate, resetForm, normalizePhone, upperCase } from "@common/utils/helpers";

import * as Strings from "@common/constants/strings";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  number,
  postalCode,
  validateSelectOptions,
} from "@common/utils/Validate";

import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isPerson: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  partyRelationshipTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  roles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
};

export const MergePartyConfirmationForm = (props) => {
  const columns = [
    {
      title: "Mine Name",
      width: 150,
      dataIndex: "mine_name",
      render: (text, record) => (
        <div key={record.key} title="Mine Name">
          {text || Strings.EMPTY_FIELD} ({record.mine.mine_no})
        </div>
      ),
    },
    {
      title: "Role",
      width: 150,
      dataIndex: "mine_party_appt_type_code",
      render: (text) => <div title="Role">{props.partyRelationshipTypesHash[text]}</div>,
    },
    {
      title: "Start Date - End Date",
      width: 150,
      dataIndex: "dates",
      render: (text) => <div title="Start Date - End Date">{text}</div>,
    },
  ];

  const transformRowData = (roles) =>
    roles.map((role) => ({
      key: role.party_guid,
      mine_name: role.mine.mine_name,
      dates: role.end_date
        ? `${formatDate(role.start_date)} - ${formatDate(role.end_date)}`
        : `${formatDate(role.start_date)} - Present`,
      ...role,
    }));

  return (
    <div>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        <Alert
          message="Ensure the information is correct"
          description="Once the merge is complete a new contact will be created and all previous contacts selected will be deleted. All roles listed will be copied over to the new contact."
          type="info"
          showIcon
        />
        <br />
        <Row gutter={24}>
          <Col span={12} className="border--right--layout">
            <>
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
                        label="Organization Name*"
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
                      label="Email*"
                      component={renderConfig.FIELD}
                      validate={[email, required]}
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
              <FormSection name="address">
                <>
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
                          validate={[validateSelectOptions(props.provinceOptions)]}
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
                          validate={[maxLength(10), postalCode]}
                          normalize={upperCase}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              </FormSection>
            </>
          </Col>
          <Col span={12}>
            <CoreTable
              condition
              dataSource={transformRowData(props.roles)}
              columns={columns}
              scroll={{ y: 500 }}
            />
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={props.closeModal}
            okText="Yes"
            cancelText="No"
            disabled={props.submitting}
          >
            <Button className="full-mobile" type="secondary" disabled={props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
          <AuthorizationWrapper permission={Permission.ADMINISTRATIVE_USERS}>
            <Button
              className="full-mobile"
              type="primary"
              htmlType="submit"
              loading={props.submitting}
            >
              {props.title}
            </Button>
          </AuthorizationWrapper>
        </div>
      </Form>
    </div>
  );
};

MergePartyConfirmationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.MERGE_PARTY_CONFIRMATION,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.MERGE_PARTY_CONFIRMATION),
})(MergePartyConfirmationForm);
