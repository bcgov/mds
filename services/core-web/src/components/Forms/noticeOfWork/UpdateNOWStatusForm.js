import React from "react";
import { Field, reduxForm } from "redux-form";
import { Form } from "antd";
import PropTypes from "prop-types";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  dropdownNoticeOfWorkApplicationStatusOptions: CustomPropTypes.options.isRequired,
  setStatus: PropTypes.func.isRequired,
};

const UpdateNOWStatusForm = (props) => {
  return (
    <div>
      <Form layout="vertical">
        <Form.Item>
          <Field
            id="now_application_status_code"
            name="now_application_status_code"
            label="Status"
            component={renderConfig.SELECT}
            placeholder="Select the status"
            validate={[required]}
            data={props.dropdownNoticeOfWorkApplicationStatusOptions}
            onSelect={props.setStatus}
            doNotPinDropdown
          />
        </Form.Item>
      </Form>
    </div>
  );
};

UpdateNOWStatusForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.UPDATE_NOW_STATUS,
})(UpdateNOWStatusForm);
