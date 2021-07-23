import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import RenderMineSelect from "@/components/common/RenderMineSelect";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const ChangeNOWMineForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col span={24}>
        <Form.Item>
          <Field
            id="mine_guid"
            name="mine_guid"
            component={RenderMineSelect}
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
      <Button
        className="full-mobile"
        type="primary"
        htmlType="submit"
        disabled={props.initialValues?.mine_guid === props.formValues?.mine_guid}
        loading={props.submitting}
      >
        {props.title}
      </Button>
    </div>
  </Form>
);

ChangeNOWMineForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.CHANGE_NOW_MINE)(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.CHANGE_NOW_MINE,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.CHANGE_NOW_MINE),
  })
)(ChangeNOWMineForm);
