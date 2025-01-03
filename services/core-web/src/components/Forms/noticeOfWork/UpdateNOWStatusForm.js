import React from "react";
import { Field } from "redux-form";
import { Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import { required } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { resetForm } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  dropdownNoticeOfWorkApplicationStatusOptions: CustomPropTypes.options.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  closeModal: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

const UpdateNOWStatusForm = (props) => {
  return (
    <div>
      <FormWrapper
        name={FORM.UPDATE_NOW_STATUS}
        reduxFormConfig={{
          touchOnBlur: false,
          onSubmitSuccess: resetForm(FORM.UPDATE_NOW_STATUS),
        }}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}>
        <Field
          id="now_application_status_code"
          name="now_application_status_code"
          label="Previous Status"
          component={renderConfig.SELECT}
          placeholder="Select the status"
          required
          validate={[required]}
          data={props.dropdownNoticeOfWorkApplicationStatusOptions.filter(
            ({ value }) => value !== "AIA"
          )}
          disabled
        />
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
      </FormWrapper>
    </div>
  );
};

UpdateNOWStatusForm.propTypes = propTypes;

export default UpdateNOWStatusForm;
