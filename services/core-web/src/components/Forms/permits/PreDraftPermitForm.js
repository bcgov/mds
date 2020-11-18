import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isAmendment: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

export const PreDraftPermitForm = (props) => {
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={24}>
          {props.isAmendment ? (
            <div className="left">
              <Form.Item>
                <Field
                  id="permit_guid"
                  name="permit_guid"
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
                />
              </Form.Item>
            </div>
          )}
        </Col>
      </Row>
    </Form>
  );
};

PreDraftPermitForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.PRE_DRAFT_PERMIT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.PRE_DRAFT_PERMIT),
})(PreDraftPermitForm);
