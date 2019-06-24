import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineTSFRequiredReportsDropDown: PropTypes.arrayOf(PropTypes.any).isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const AddTailingsReportForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Form.Item>
      <Field
        id="req_document_guid"
        name="req_document_guid"
        label="TSF Required Reports"
        placeholder="Please select a required report"
        data={props.mineTSFRequiredReportsDropDown}
        doNotPinDropdown
        component={renderConfig.SELECT}
        validate={[required]}
      />
    </Form.Item>
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

AddTailingsReportForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_TAILINGS_REPORT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_TAILINGS_REPORT),
})(AddTailingsReportForm);
