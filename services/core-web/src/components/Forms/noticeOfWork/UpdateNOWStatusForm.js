import React from "react";
import { Field, reduxForm } from "redux-form";
import { Popconfirm, Button } from "antd";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import PropTypes from "prop-types";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { resetForm } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@mds/common/constants/permissions";

const propTypes = {
  dropdownNoticeOfWorkApplicationStatusOptions: CustomPropTypes.options.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

const UpdateNOWStatusForm = (props) => {
  return (
    <div>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        <Form.Item>
          <Field
            id="now_application_status_code"
            name="now_application_status_code"
            label="Previous Status*"
            component={renderConfig.SELECT}
            placeholder="Select the status"
            validate={[required]}
            data={props.dropdownNoticeOfWorkApplicationStatusOptions.filter(
              ({ value }) => value !== "AIA"
            )}
            disabled
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
          <AuthorizationWrapper permission={Permission.ADMIN}>
            <Button
              className="full-mobile"
              type="danger"
              htmlType="submit"
              disabled={props.disabled}
            >
              {props.title}
            </Button>
          </AuthorizationWrapper>
        </div>
      </Form>
    </div>
  );
};

UpdateNOWStatusForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.UPDATE_NOW_STATUS,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.UPDATE_NOW_STATUS),
})(UpdateNOWStatusForm);
