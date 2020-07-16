/* eslint-disable */
import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import { getDropdownPermitStatusOptions } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const PreDraftPermitForm = (props) => {
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col>
          {props.isAmendment ? (
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
          ) : (
            <div className="left">
              <Form.Item>
                <Field
                  id="isExploration"
                  name="isExploration"
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
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        <Button
          className="full-mobile"
          type="primary"
          htmlType="submit"
          disabled={props.submitting}
        >
          Start Draft Permit
        </Button>
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
