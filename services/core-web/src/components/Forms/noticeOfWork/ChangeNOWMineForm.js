import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import RenderMineSelect from "@/components/common/RenderMineSelect";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const ChangeNOWMineForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="mine_guid"
            name="mine_guid"
            component={RenderMineSelect}
            validate={[required]}
            showCard
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

ChangeNOWMineForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CHANGE_NOW_MINE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.CHANGE_NOW_MINE),
})(ChangeNOWMineForm);
