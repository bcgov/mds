import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import {
  required,
  email,
  phoneNumber,
  maxLength,
  validateSelectOptions,
  requiredRadioButton,
} from "@common/utils/Validate";
import {
  getMineRegionDropdownOptions,
  getDropdownEMLIContactTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { resetForm, normalizePhone } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  regionDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  EMLIContactTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
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
export const EMLIContactForm = (props) => {
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
    return props.EMLIContactTypes.filter(({ value }) => !codes.includes(value));
  };

  return (
    <div>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Field
                id="is_major_mine"
                name="is_major_mine"
                label="Is this a Major Mine Contact?*"
                type="checkbox"
                component={renderConfig.RADIO}
                validate={[requiredRadioButton]}
                disabled={props.isEdit}
              />
            </Form.Item>
          </Col>
          {props.formValues.is_major_mine && (
            <Col span={12}>
              <Form.Item>
                <Field
                  id="is_general_contact"
                  name="is_general_contact"
                  label={
                    <>
                      Is this a general contact?*{" "}
                      <CoreTooltip title="General Contacts will be shown on MineSpace in addition to the Regional Contacts." />
                    </>
                  }
                  type="checkbox"
                  validate={[requiredRadioButton]}
                  component={renderConfig.RADIO}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="mine_region_code"
                name="mine_region_code"
                label={props.formValues.is_major_mine ? "Mine Region" : "Mine Region*"}
                placeholder="Select a mine Region"
                component={renderConfig.SELECT}
                validate={
                  props.formValues.is_major_mine
                    ? [validateSelectOptions(props.regionDropdownOptions)]
                    : [required, validateSelectOptions(props.regionDropdownOptions)]
                }
                data={props.regionDropdownOptions}
                disabled={props.isEdit}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="emli_contact_type_code"
                name="emli_contact_type_code"
                label="Contact Type*"
                placeholder="Select a contact type"
                component={renderConfig.SELECT}
                validate={[required]}
                data={filteredContactTypes()}
                disabled={props.isEdit}
              />
            </Form.Item>
          </Col>
        </Row>
        {!officeCodes.includes(props.formValues.emli_contact_type_code) && (
          <>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="first_name"
                    name="first_name"
                    label="First Name*"
                    component={renderConfig.FIELD}
                    validate={[required]}
                    disabled={!props.formValues.emli_contact_type_code}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="last_name"
                    name="last_name"
                    label="Surname*"
                    component={renderConfig.FIELD}
                    validate={[required]}
                    disabled={!props.formValues.emli_contact_type_code}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
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
                disabled={!props.formValues.emli_contact_type_code}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="phone_number"
                name="phone_number"
                label="Phone Number*"
                placeholder="e.g. xxx-xxx-xxxx"
                component={renderConfig.FIELD}
                validate={[required, phoneNumber, maxLength(12)]}
                normalize={normalizePhone}
                disabled={!props.formValues.emli_contact_type_code}
              />
            </Form.Item>
          </Col>
        </Row>
        {officeCodes.includes(props.formValues.emli_contact_type_code) && (
          <>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item>
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
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item>
                  <Field
                    id="mailing_address_line_1"
                    name="mailing_address_line_1"
                    label={
                      props.formValues.emli_contact_type_code === regionalOfficeCode
                        ? "Mailing Address Line 1*"
                        : "Mailing Address Line 1"
                    }
                    component={renderConfig.AUTO_SIZE_FIELD}
                    validate={
                      props.formValues.emli_contact_type_code === regionalOfficeCode
                        ? [required]
                        : []
                    }
                    disabled={!props.formValues.emli_contact_type_code}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item>
                  <Field
                    id="mailing_address_line_2"
                    name="mailing_address_line_2"
                    label={
                      props.formValues.emli_contact_type_code === regionalOfficeCode
                        ? "Mailing Address Line 2*"
                        : "Mailing Address Line 2"
                    }
                    component={renderConfig.AUTO_SIZE_FIELD}
                    validate={
                      props.formValues.emli_contact_type_code === regionalOfficeCode
                        ? [required]
                        : []
                    }
                    disabled={!props.formValues.emli_contact_type_code}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

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
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={props.submitting}
          >
            {props.title}
          </Button>
        </div>
      </Form>
    </div>
  );
};

EMLIContactForm.propTypes = propTypes;
EMLIContactForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.EMLI_CONTACT_FORM)(state) || {},
    regionDropdownOptions: getMineRegionDropdownOptions(state),
    EMLIContactTypes: getDropdownEMLIContactTypes(state),
  })),
  reduxForm({
    form: FORM.EMLI_CONTACT_FORM,
    onSubmitSuccess: resetForm(FORM.EMLI_CONTACT_FORM),
    touchOnBlur: false,
    enableReinitialize: true,
  })
)(EMLIContactForm);
