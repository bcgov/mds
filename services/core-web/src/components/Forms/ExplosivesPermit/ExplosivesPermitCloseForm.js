/* eslint-disable */
import React from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, change } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, requiredRadioButton } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getExplosivesPermitStatusDropdownOptions } from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  explosivesPermitStatusDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem)
    .isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  initialValues: CustomPropTypes.permit.isRequired,
};

const options = [
  {
    value: false,
    label: "Open",
  },
  {
    value: true,
    label: "Closed",
  },
];

export const ExplosivesPermitCloseForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="is_closed"
              name="is_closed"
              label="Permit Status*"
              component={RenderRadioButtons}
              customOptions={options}
              validate={[requiredRadioButton]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="closed_reason"
              name="closed_reason"
              label="Reason"
              component={RenderAutoSizeField}
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
};

ExplosivesPermitCloseForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  explosivesPermitStatusDropdownOptions: getExplosivesPermitStatusDropdownOptions(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.EXPLOSIVES_PERMIT_CLOSE,
    touchOnBlur: false,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT_CLOSE),
  })
)(ExplosivesPermitCloseForm);
