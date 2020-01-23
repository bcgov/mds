import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import { getDropdownNoticeOfWorkApplicationTypeOptions } from "@/selectors/staticContentSelectors";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool,
  handleMineSelect: PropTypes.func.isRequired,
  applicationTypeOptions: PropTypes.arrayOf(CustomPropTypes.options).isRequired,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  isSubmitting: false,
};
export const MMPermitApplicationInitForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row>
      <Col>
        <Form.Item>
          <Field
            id="permit_guid"
            name="permit_guid"
            label="Select a Permit *"
            component={renderConfig.SELECT}
            data={props.minePermits}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Item>
          <Field
            id="notice_of_work_type_code"
            name="notice_of_work_type_code"
            label="Permit Application Type *"
            component={renderConfig.SELECT}
            data={props.applicationTypeOptions}
            validate={[required]}
          />
        </Form.Item>
      </Col>
      <Col>
        <Form.Item>
          <Field
            id="submitted_date"
            name="submitted_date"
            label="Submitted Date *"
            component={renderConfig.DATE}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="received_date"
            name="received_date"
            label="Received Date *"
            component={renderConfig.DATE}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
    <div className="right center-mobile">
      <Button
        className="full-mobile"
        type="primary"
        htmlType="submit"
        disabled={props.isSubmitting}
      >
        {props.title}
      </Button>
    </div>
  </Form>
);

const mapStateToProps = (state) => ({
  applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state),
});

MMPermitApplicationInitForm.propTypes = propTypes;
MMPermitApplicationInitForm.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.MM_PERMIT_APPLICATION_CREATE,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.MM_PERMIT_APPLICATION_CREATE),
  })
)(MMPermitApplicationInitForm);
