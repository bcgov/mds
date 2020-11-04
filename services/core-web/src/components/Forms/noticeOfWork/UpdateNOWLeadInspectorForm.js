import React from "react";
import { Field, reduxForm } from "redux-form";
import { Button, Popconfirm } from "antd";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import PropTypes from "prop-types";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  inspectors: CustomPropTypes.groupOptions.isRequired,
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isAdminView: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  setEditMode: PropTypes.func.isRequired,
  title: PropTypes.bool.isRequired,
};

const UpdateNOWLeadInspectorForm = (props) => {
  return (
    <div>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        <div className="field-title">Lead Inspector</div>
        <Form.Item>
          <Field
            id="lead_inspector_party_guid"
            name="lead_inspector_party_guid"
            label={
              !props.isAdminView
                ? "Assign a lead inspector before continuing. This assignment can be updated later under the Administrative tab."
                : ""
            }
            component={renderConfig.GROUPED_SELECT}
            placeholder="Start typing lead inspectors name"
            validate={[required]}
            data={props.inspectors}
            disabled={!props.isEditMode}
            onSelect={props.setLeadInspectorPartyGuid}
          />
        </Form.Item>
        {props.isEditMode && (
          <div className="right center-mobile">
            {props.isAdminView && (
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to cancel?"
                onConfirm={() => props.setEditMode(false)}
                okText="Yes"
                cancelText="No"
              >
                <Button className="full-mobile" type="secondary">
                  Cancel
                </Button>
              </Popconfirm>
            )}
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <Button htmlType="submit" type="primary">
                {props.title}
              </Button>
            </AuthorizationWrapper>
          </div>
        )}
      </Form>
    </div>
  );
};

UpdateNOWLeadInspectorForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.UPDATE_NOW_LEAD_INSPECTOR,
  touchOnBlur: true,
})(UpdateNOWLeadInspectorForm);
