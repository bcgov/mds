import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  cancelPreDraft: PropTypes.func.isRequired,
  isAmendment: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

export const PreDraftPermitForm = (props) => {
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
          {props.isAmendment ? (
            <div className="left">
              <Form.Item>
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  label="Permit *"
                  placeholder="Select a Permit"
                  doNotPinDropdown
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  validate={[required]}
                />
              </Form.Item>
            </div>
          ) : (
            <div className="left">
              <Form.Item>
                <Field
                  id="is_exploration"
                  name="is_exploration"
                  label="Exploration Permit"
                  component={renderConfig.CHECKBOX}
                  validate={[required]}
                />
              </Form.Item>
            </div>
          )}
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to stop the process of starting a draft permit?"
          onConfirm={props.cancelPreDraft}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={props.submitting}
          >
            Start Draft Permit
          </Button>
        </AuthorizationWrapper>
      </div>
    </Form>
  );
};

PreDraftPermitForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.PRE_DRAFT_PERMIT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.PRE_DRAFT_PERMIT),
})(PreDraftPermitForm);
