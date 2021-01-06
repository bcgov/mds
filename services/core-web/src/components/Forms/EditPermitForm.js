import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { getFormValues, Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { currency, required, validateSelectOptions } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownPermitStatusOptions } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
import RenderField from "@/components/common/RenderField";
import { currencyMask } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  formValues: PropTypes.objectOf(PropTypes.strings),
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const EditPermitForm = (props) => (
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

EditPermitForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    permitStatusOptions: getDropdownPermitStatusOptions(state),
    formValues: getFormValues(FORM.EDIT_PERMIT)(state) || {},
  })),
  reduxForm({
    form: FORM.EDIT_PERMIT,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.EDIT_PERMIT),
  })
)(EditPermitForm);
