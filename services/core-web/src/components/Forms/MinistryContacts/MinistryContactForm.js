import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, getFormValues } from "redux-form";
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
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  regionDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  MinistryContactTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  isEdit: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
};

const defaultProps = {
  formValues: {},
};

const regionalOfficeCode = "ROE";
const majorMineOfficeCode = "MMO";
const chiefPermittingCode = "CHP";
const chiefInspectorCode = "CHI";
const officeCodes = [regionalOfficeCode, majorMineOfficeCode];
export const MinistryContactForm = (props) => {
  const filteredContactTypes = () => {
    const codes = [];
    const containsAllOffices =
      props.contacts.filter(
        ({ emli_contact_type_code }) => emli_contact_type_code === regionalOfficeCode
      ).length === props.regionDropdownOptions.length;
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
    return props.MinistryContactTypes.filter(({ value }) => !codes.includes(value));
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
          {props.formValues.is_major_mine && (
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
              required={!props.formValues.is_major_mine}
              validate={
                props.formValues.is_major_mine
                  ? []
                  : [required]
              }
              data={props.regionDropdownOptions}
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
        {!officeCodes.includes(props.formValues.emli_contact_type_code) && (
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                id="first_name"
                name="first_name"
                label="First Name"
                component={renderConfig.FIELD}
                required
                validate={[required]}
                disabled={!props.formValues.emli_contact_type_code}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="last_name"
                name="last_name"
                label="Surname"
                component={renderConfig.FIELD}
                required
                validate={[required]}
                disabled={!props.formValues.emli_contact_type_code}
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
              disabled={!props.formValues.emli_contact_type_code}
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
              required
              validate={[required, phoneNumber, maxLength(12)]}
              normalize={normalizePhone}
              disabled={!props.formValues.emli_contact_type_code}
            />
          </Col>
        </Row>
        {officeCodes.includes(props.formValues.emli_contact_type_code) && (
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
                  disabled={!props.formValues.emli_contact_type_code}
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
                  required={props.formValues.emli_contact_type_code === regionalOfficeCode}
                  validate={
                    props.formValues.emli_contact_type_code === regionalOfficeCode
                      ? [required]
                      : []
                  }
                  disabled={!props.formValues.emli_contact_type_code}
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
                  required={props.formValues.emli_contact_type_code === regionalOfficeCode}
                  validate={
                    props.formValues.emli_contact_type_code === regionalOfficeCode
                      ? [required]
                      : []
                  }
                  disabled={!props.formValues.emli_contact_type_code}
                />
              </Col>
            </Row>
          </>
        )}

        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton buttonText={props.title} />
        </div>
      </FormWrapper>
    </div>
  );
};

MinistryContactForm.propTypes = propTypes;
MinistryContactForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.MINISTRY_CONTACT_FORM)(state) || {},
    regionDropdownOptions: getMineRegionDropdownOptions(state),
    MinistryContactTypes: getDropdownMinistryContactTypes(state),
  }))
)(MinistryContactForm);
