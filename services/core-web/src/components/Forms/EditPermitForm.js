import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Col, Row, Popconfirm } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownPermitStatusOptions } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
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
            validate={[required]}
          />
        </Form.Item>
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
  })),
  reduxForm({
    form: FORM.EDIT_PERMIT,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.EDIT_PERMIT),
  })
)(EditPermitForm);
