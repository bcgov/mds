import React from "react";
import PropTypes from "prop-types";
import { reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture } from "@/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { Field } from "redux-form";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  review_types: CustomPropTypes.options.isRequired,
};

export const NOWReviewForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="now_application_review_type_code"
            name="now_application_review_type_code"
            label="Review Type"
            component={renderConfig.SELECT}
            data={props.review_types}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="referee_name"
            name="referee_name"
            label="Referee Name"
            component={renderConfig.FIELD}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="response_date"
            name="response_date"
            label="Response Recieved"
            component={renderConfig.DATE}
            validate={[required, dateNotInFuture]}
          />
        </Form.Item>{" "}
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

NOWReviewForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_NOW_REVIEW,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_NOW_REVIEW),
})(NOWReviewForm);
