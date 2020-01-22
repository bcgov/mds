import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit),
  handleMineSelect: PropTypes.func.isRequired,
};

const defaultProps = {
  minePermits: [],
};

export const MMPermitApplicationInitForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="mine_guid"
            name="mine_guid"
            component={renderConfig.MINE_SELECT}
            majorMineOnly
            validate={[required]}
            onMineSelect={props.handleMineSelect}
            showCard
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Item>
          <Field
            id="permit_guid"
            name="permit_guid"
            label="Select a Permit:"
            component={renderConfig.SELECT}
            data={props.minePermits}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
    <div className="right center-mobile">
      <Button className="full-mobile" type="primary" htmlType="submit">
        {props.title}
      </Button>
    </div>
  </Form>
);

MMPermitApplicationInitForm.propTypes = propTypes;
MMPermitApplicationInitForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.MM_PERMIT_APPLICATION_CREATE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.MM_PERMIT_APPLICATION_CREATE),
})(MMPermitApplicationInitForm);
