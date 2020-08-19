import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Button, Popconfirm, Form } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  onCancel: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

export const SectionForm = (props) => (
  <Form onSubmit={props.handleSubmit}>
    <Field
      id="condition"
      name="condition"
      placeholder="Subsection Name"
      required
      component={renderConfig.FIELD}
      validate={[required]}
    />
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.onCancel}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
        Save
      </Button>
    </div>
  </Form>
);

SectionForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CONDITION_SECTION,
  onSubmitSuccess: resetForm(FORM.CONDITION_SECTION),
})(SectionForm);
