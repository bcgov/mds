import React, { useEffect } from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { getFormValues, Field, reduxForm, change } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { currency, required, validateSelectOptions, maxLength } from "@common/utils/Validate";
import { resetForm, determineExemptionFeeStatus, currencyMask } from "@common/utils/helpers";
import {
  getDropdownPermitStatusOptions,
  getExemptionFeeStatusDropDownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  formValues: PropTypes.objectOf(PropTypes.strings).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  initialValues: CustomPropTypes.permit.isRequired,
  change: PropTypes.func.isRequired,
  exemptionFeeStatusDropDownOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
};

export const EditPermitForm = (props) => {
  useEffect(() => {
    const isExploration = props.initialValues.permit_no.charAt(1) === "X";
    const feeStatus = determineExemptionFeeStatus(
      props.formValues?.permit_status_code,
      props.initialValues.permit_prefix,
      props.initialValues.site_properties?.mine_tenure_type_code,
      isExploration,
      props.initialValues.site_properties?.mine_disturbance_code
    );
    props.change("exemption_fee_status_code", feeStatus);
  }, [props.formValues?.permit_status_code]);

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="permit_status_code"
              name="permit_status_code"
              label="Permit status*"
              placeholder="Select a permit status"
              component={RenderSelect}
              data={props.permitStatusOptions}
              validate={[required, validateSelectOptions(props.permitStatusOptions)]}
            />
          </Form.Item>
          {(props.formValues.permit_status_code === "C" ||
            props.formValues.remaining_static_liability !== null) && (
            <Form.Item>
              <Field
                id="remaining_static_liability"
                name="remaining_static_liability"
                label="Remaining outstanding liability amount (if any)"
                placeholder="$0.00"
                {...currencyMask}
                component={RenderField}
                validate={[currency]}
              />
            </Form.Item>
          )}
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="exemption_fee_status_code"
            name="exemption_fee_status_code"
            label="Inspection Fee Status"
            placeholder="Inspection Fee Status will be automatically populated."
            component={RenderSelect}
            disabled
            data={props.exemptionFeeStatusDropDownOptions}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="exemption_fee_status_note"
            name="exemption_fee_status_note"
            label="Fee Exemption Note"
            component={RenderAutoSizeField}
            validate={[maxLength(300)]}
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
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
          {props.title}
        </Button>
      </div>
    </Form>
  );
};

EditPermitForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
  formValues: getFormValues(FORM.EDIT_PERMIT)(state) || {},
  exemptionFeeStatusDropDownOptions: getExemptionFeeStatusDropDownOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.EDIT_PERMIT,
    touchOnBlur: false,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.EDIT_PERMIT),
  })
)(EditPermitForm);
