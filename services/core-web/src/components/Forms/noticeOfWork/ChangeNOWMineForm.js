import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import RenderMineSelect from "@/components/common/RenderMineSelect";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const ChangeNOWMineForm = (props) => (
  <FormWrapper
    name={FORM.CHANGE_NOW_MINE}
    initialValues={props.initialValues}
    reduxFormConfig={{
      touchOnBlur: false,
      onSubmitSuccess: resetForm(FORM.CHANGE_NOW_MINE),
    }}
    onSubmit={props.onSubmit}>
    <Row gutter={16}>
      <Col span={24}>
        <Field
          id="mine_guid"
          name="mine_guid"
          component={RenderMineSelect}
          required
          validate={[required]}
        />
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
  </FormWrapper>
);

ChangeNOWMineForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.CHANGE_NOW_MINE)(state),
});

export default compose(
  connect(mapStateToProps)
)(ChangeNOWMineForm);
