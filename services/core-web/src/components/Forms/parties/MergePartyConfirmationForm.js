import React from "react";
import PropTypes from "prop-types";
import { Field, FormSection, getFormValues } from "redux-form";
import { Col, Row, Alert } from "antd";
import CoreTable from "@mds/common/components/common/CoreTable";
import { formatDate, normalizePhone, upperCase } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  number,
  postalCodeWithCountry,
} from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { useSelector } from "react-redux";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  isPerson: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  partyRelationshipTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  roles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
};

export const MergePartyConfirmationForm = (props) => {
  const { sub_division_code } = useSelector(getFormValues(FORM.MERGE_PARTY_CONFIRMATION)) ?? {};
  const province = props.provinceOptions.find((prov) => prov.value === sub_division_code);
  const address_type_code = province?.subType;

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
      <FormWrapper
        name={FORM.MERGE_PARTY_CONFIRMATION}
        onSubmit={props.onSubmit}
        isModal
        initialValues={props.initialValues}
        reduxFormConfig={{
          touchOnBlur: false,
        }}
      >
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
                    label="Email"
                    component={renderConfig.FIELD}
                    required
                    validate={[email, required]}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={18}>
                  <Field
                    id="phone_no"
                    name="phone_no"
                    label="Phone Number"
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
              <FormSection name="address">
                <>
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
          <RenderCancelButton />
          <AuthorizationWrapper permission={Permission.ADMINISTRATIVE_USERS}>
            <RenderSubmitButton buttonText={props.title} />
          </AuthorizationWrapper>
        </div>
      </FormWrapper>
    </div>
  );
};

MergePartyConfirmationForm.propTypes = propTypes;

export default MergePartyConfirmationForm;
