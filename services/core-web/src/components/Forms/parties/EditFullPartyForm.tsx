import React, { FC, useState } from "react";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { Col, Descriptions, Divider, Row, Typography } from "antd";
import { isEmpty } from "lodash";
import {
  email,
  maxLength,
  number,
  phoneNumber,
  postalCodeWithCountry,
  required,
} from "@mds/common/redux/utils/Validate";
import { formatDateTime, normalizePhone, resetForm, upperCase } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import PartyOrgBookForm from "@/components/Forms/parties/PartyOrgBookForm";
import { ORGBOOK_CREDENTIAL_URL, ORGBOOK_ENTITY_URL } from "@/constants/routes";
import PartySignatureUpload from "./PartySignatureUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { useSelector } from "react-redux";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { IParty, IPartyAddress } from "@mds/common/interfaces";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";

export interface EditFullPartyFormValues extends IParty, IPartyAddress {
  set_to_inspector: boolean;
  inspector_start_date: string;
  inspector_end_date: string;
  set_to_project_lead: boolean;
  project_lead_start_date: string;
  project_lead_end_date: string;
}

interface EditFullPartyFormProps {
  party: EditFullPartyFormValues;
  onSubmit: (values: any) => void;
  initialValues: Partial<IParty>;
}

export const EditFullPartyForm: FC<EditFullPartyFormProps> = ({
  party,
  onSubmit,
  initialValues,
}) => {
  const [signature, setSignature] = useState();
  const formValues = useAppSelector(getFormValues(FORM.EDIT_FULL_PARTY)) as EditFullPartyFormValues;
  const sub_division_code = formValues?.address?.sub_division_code ?? "";
  const provinceOptions = useSelector(getDropdownProvinceOptions);
  const province = provinceOptions?.find((prov) => prov.value === sub_division_code);
  const address_type_code = province?.subType;

  const canManageOrgbook = useAppSelector(userHasRole(USER_ROLES.role_manage_orgbook));
  const isAdmin = useAppSelector(userHasRole(USER_ROLES.role_admin));

  const onChangeSignature = (signatureBase64) => {
    setSignature(signatureBase64);
  };

  const isPerson = party.party_type_code === "PER";
  const orgBookEntity = party.party_orgbook_entity;
  const hasOrgBookEntity = !isEmpty(orgBookEntity);
  return (
    <div>
      <FormWrapper
        isModal
        name={FORM.EDIT_FULL_PARTY}
        initialValues={initialValues}
        onSubmit={(values) => {
          const party = {
            ...values,
            signature: signature,
          };
          return onSubmit(party);
        }}
        reduxFormConfig={{
          onSubmitSuccess: resetForm(FORM.EDIT_FULL_PARTY),
          enableReinitialize: true,
          keepDirtyOnReinitialize: true,
        }}
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
            {!isPerson && (
              <Row gutter={16}>
                <Col span={24}>
                  <Field
                    id="party_name"
                    name="party_name"
                    label="Organization Name"
                    component={renderConfig.FIELD}
                    required
                    validate={[required]}
                    disabled={hasOrgBookEntity}
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
                />
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
                  data={provinceOptions}
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
              (!isPerson && canManageOrgbook && (
                <Row>
                  <Col span={24}>
                    <h5>OrgBook Entity</h5>
                    <Typography.Paragraph>
                      This party has not been associated with an entity on OrgBook. To associate
                      this party with an entity on OrgBook, search for the correct entity using the
                      search below and then select the&nbsp;
                      <Typography.Text strong>Associate</Typography.Text>
                      &nbsp;button.
                    </Typography.Paragraph>
                    <PartyOrgBookForm party={party} />
                  </Col>
                </Row>
              ))}
          </Col>
        </Row>
        {isPerson && isAdmin && (
          <>
            <br />
            <Divider />
            <Row gutter={16}>
              <Col span={24}>
                <h5>Assign Inspector Role</h5>
              </Col>
            </Row>
            <Row>
              <p>
                By setting this checkbox you grant inspector role to this party. Please note that
                removing this checkbox will not delete party from associated entities.
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
                <h5>Assign Project Lead Role</h5>
              </Col>
            </Row>
            <Row>
              <p>
                By setting this checkbox you grant project lead role to this party. Please note that
                removing this checkbox will not delete party from associated entities.
              </p>
              <Col md={12} sm={24}>
                <Field
                  id="set_to_project_lead"
                  name="set_to_project_lead"
                  label="Set to project lead"
                  type="checkbox"
                  component={renderConfig.CHECKBOX}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Field
                  label="Start Date"
                  id="project_lead_start_date"
                  name="project_lead_start_date"
                  placeholder="yyyy-mm-dd"
                  component={renderConfig.DATE}
                />
              </Col>
              <Col span={12}>
                <Field
                  label="End Date"
                  id="project_lead_end_date"
                  name="project_lead_end_date"
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
                  onFileChange={onChangeSignature}
                  signature={party.signature}
                />
              </Col>
            </Row>
          </>
        )}
        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton
            buttonText={isPerson ? "Update Person" : "Update Organization"}
            disableOnClean={false}
          />
        </div>
      </FormWrapper>
    </div>
  );
};

export default EditFullPartyForm;
