import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { Col, Row } from "antd";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import {
  getMineRegionDropdownOptions,
  getDropdownMinistryContactTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { normalizePhone } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { IMinistryContact } from "@mds/common/interfaces";
import { MinistryContactTypeCodes } from "@mds/common/constants/enums";

interface IOption {
  value: string | number;
  label: string;
  isActive?: boolean;
}

export interface MinistryContactFormProps {
  onSubmit: (values: any) => void | Promise<void>;
  initialValues?: any;
  isEdit: boolean;
  title: string;
  contacts: IMinistryContact[];
  distributionListOptions: IOption[];
}

const regionalOfficeCode = MinistryContactTypeCodes.ROE;
const majorMineOfficeCode = MinistryContactTypeCodes.MMO;
const chiefPermittingCode = MinistryContactTypeCodes.CHP;
const chiefInspectorCode = MinistryContactTypeCodes.CHI;
const reportDesignatedContactCode = MinistryContactTypeCodes.RDC;
const officeCodes = [regionalOfficeCode, majorMineOfficeCode];

export const MinistryContactForm: FC<MinistryContactFormProps> = (props) => {
  const formValues: any = useSelector((state) => getFormValues(FORM.MINISTRY_CONTACT_FORM)(state)) || {};
  const regionDropdownOptions: IOption[] = useSelector(getMineRegionDropdownOptions);
  const MinistryContactTypes: IOption[] = useSelector((state) => getDropdownMinistryContactTypes(state, false));

  const filteredContactTypes = () => {
    const codes: string[] = [];
    const containsAllOffices =
      props.contacts.filter(
        ({ emli_contact_type_code }) => emli_contact_type_code === regionalOfficeCode
      ).length === regionDropdownOptions.length;
    const containsMMO = props.contacts.some(
      ({ emli_contact_type_code }) => emli_contact_type_code === majorMineOfficeCode
    );
    const containsCheifPermitting = props.contacts.some(
      ({ emli_contact_type_code }) => emli_contact_type_code === chiefPermittingCode
    );
    const containsCheifInspector = props.contacts.some(
      ({ emli_contact_type_code }) => emli_contact_type_code === chiefInspectorCode
    );
    
    if (!props.isEdit) {
      if (containsAllOffices) {
        codes.push(regionalOfficeCode);
      }
      if (containsMMO) {
        codes.push(majorMineOfficeCode);
      }
      if (containsCheifPermitting) {
        codes.push(chiefPermittingCode);
      }
      if (containsCheifInspector) {
        codes.push(chiefInspectorCode);
      }
    }
    return MinistryContactTypes.filter(({ value, isActive }) => {
      const isCurrentValue = value === props.initialValues?.emli_contact_type_code;
      return (isActive || isCurrentValue) && !codes.includes(value as string);
    });
  };

  return (
    <div>
      <FormWrapper onSubmit={props.onSubmit}
        isModal
        initialValues={props.initialValues}
        name={FORM.MINISTRY_CONTACT_FORM}
        reduxFormConfig={{
          touchOnBlur: false,
          enableReinitialize: true,
          validate: (values: IMinistryContact) => {
            const errors: any = {};
            const isRDC = values.emli_contact_type_code === reportDesignatedContactCode;
            const isOffice = officeCodes.includes(
              values.emli_contact_type_code as MinistryContactTypeCodes
            );

            if (!isOffice) {
              if (!isRDC) {
                if (!values.first_name) {
                  errors.first_name = "This is a required field";
                }
                if (!values.last_name) {
                  errors.last_name = "This is a required field";
                }
              }
            }

            if (!values.email) {
              errors.email = "This is a required field";
            }
            if (values.emli_contact_type_code !== reportDesignatedContactCode && !values.phone_number) {
              errors.phone_number = "This is a required field";
            }

            return errors;
          }
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Field
              id="is_major_mine"
              name="is_major_mine"
              label="Is this a Major Mine Contact?"
              type="checkbox"
              component={renderConfig.RADIO}
              required
              validate={[requiredRadioButton]}
              disabled={props.isEdit}
            />
          </Col>
          {formValues.is_major_mine !== undefined && (
            <Col span={12}>
              <Field
                id="is_general_contact"
                name="is_general_contact"
                label={
                  <>
                    Is this a general contact?{" "}
                    <CoreTooltip title="General Contacts will be shown on MineSpace in addition to the Regional Contacts." />
                  </>
                }
                type="checkbox"
                required
                validate={[requiredRadioButton]}
                component={renderConfig.RADIO}
              />
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Field
              id="mine_region_code"
              name="mine_region_code"
              label={"Mine Region"}
              placeholder="Select a mine Region"
              component={renderConfig.SELECT}
              required={!formValues.is_major_mine && formValues.emli_contact_type_code !== reportDesignatedContactCode}
              validate={
                formValues.is_major_mine || formValues.emli_contact_type_code === reportDesignatedContactCode
                  ? []
                  : [required]
              }
              data={regionDropdownOptions}
              disabled={props.isEdit}
            />
          </Col>
          <Col md={12} xs={24}>
            <Field
              id="emli_contact_type_code"
              name="emli_contact_type_code"
              label="Contact Type"
              placeholder="Select a contact type"
              component={renderConfig.SELECT}
              required
              validate={[required]}
              data={filteredContactTypes()}
              disabled={props.isEdit}
            />
          </Col>
        </Row>
        {!officeCodes.includes(formValues.emli_contact_type_code) && (
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                id="first_name"
                name="first_name"
                label="First Name"
                component={renderConfig.FIELD}
                required={formValues.emli_contact_type_code && formValues.emli_contact_type_code !== reportDesignatedContactCode}
                disabled={!formValues.emli_contact_type_code}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="last_name"
                name="last_name"
                label="Surname"
                component={renderConfig.FIELD}
                required={formValues.emli_contact_type_code && formValues.emli_contact_type_code !== reportDesignatedContactCode}
                disabled={!formValues.emli_contact_type_code}
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
              validate={[email]}
              disabled={!formValues.emli_contact_type_code}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="phone_number"
              name="phone_number"
              label="Phone Number"
              placeholder="e.g. xxx-xxx-xxxx"
              component={renderConfig.FIELD}
              required={formValues.emli_contact_type_code !== reportDesignatedContactCode}
              validate={[phoneNumber, maxLength(12)]}
              normalize={normalizePhone}
              disabled={!formValues.emli_contact_type_code}
            />
          </Col>
        </Row>
        {officeCodes.includes(formValues.emli_contact_type_code) && (
          <>
            <Row gutter={16}>
              <Col span={24}>
                <Field
                  id="fax_number"
                  name="fax_number"
                  label="Fax Number"
                  placeholder="e.g. xxx-xxx-xxxx"
                  component={renderConfig.FIELD}
                  validate={[phoneNumber, maxLength(12)]}
                  normalize={normalizePhone}
                  disabled={!formValues.emli_contact_type_code}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Field
                  id="mailing_address_line_1"
                  name="mailing_address_line_1"
                  label={"Mailing Address Line 1"}
                  component={renderConfig.AUTO_SIZE_FIELD}
                  required={formValues.emli_contact_type_code === regionalOfficeCode}
                  validate={
                    formValues.emli_contact_type_code === regionalOfficeCode
                      ? [required]
                      : []
                  }
                  disabled={!formValues.emli_contact_type_code}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Field
                  id="mailing_address_line_2"
                  name="mailing_address_line_2"
                  label={"Mailing Address Line 2"}
                  component={renderConfig.AUTO_SIZE_FIELD}
                  required={formValues.emli_contact_type_code === regionalOfficeCode}
                  validate={
                    formValues.emli_contact_type_code === regionalOfficeCode
                      ? [required]
                      : []
                  }
                  disabled={!formValues.emli_contact_type_code}
                />
              </Col>
            </Row>
          </>
        )}
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="distribution_list_guids"
              name="distribution_list_guids"
              label="Notification Groups"
              placeholder="Select Notification Groups"
              component={renderConfig.MULTI_SELECT}
              data={props.distributionListOptions}
            />
          </Col>
        </Row>

        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton buttonText={props.title} />
        </div>
      </FormWrapper>
    </div>
  );
};

export default MinistryContactForm;
