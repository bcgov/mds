import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required, dateNotInFuture, maxLength } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderDate from "@/components/common/RenderDate";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  bondStatusCode: PropTypes.string.isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  submitting: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
};

export const CloseBondForm = (props) => {
  const bondStatusDescription = props.bondStatusOptionsHash[props.bondStatusCode];
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row>
        <Col>
          <Form.Item>
            <Field
              id="closed_date"
              name="closed_date"
              label={`${bondStatusDescription} Date*`}
              showTime
              component={RenderDate}
              validate={[required, dateNotInFuture]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Item>
            <Field
              id="closed_note"
              name="closed_note"
              label={`${bondStatusDescription} Notes`}
              component={RenderAutoSizeField}
              validate={[maxLength(4000)]}
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
        <Button
          className="full-mobile"
          type="primary"
          htmlType="submit"
          disabled={props.submitting || props.pristine}
        >
          {props.title}
        </Button>
      </div>
    </Form>
  );
};

CloseBondForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CLOSE_BOND,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.CLOSE_BOND),
})(CloseBondForm);
