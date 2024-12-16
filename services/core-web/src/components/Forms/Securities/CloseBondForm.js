import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row, Popconfirm } from "antd";
import {
  required,
  date,
  dateNotInFuture,
  maxLength,
  dateNotBeforeOther,
} from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderField from "@mds/common/components/forms/RenderField";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  bond: CustomPropTypes.bond.isRequired,
  bondStatusCode: PropTypes.string.isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const CloseBondForm = (props) => {
  const bondStatusDescription = props.bondStatusOptionsHash[props.bondStatusCode];
  return (
    <FormWrapper onSubmit={props.handleSubmit}
      name={FORM.CLOSE_BOND}
      reduxFormConfig={{
        enableReinitialize: true,
        touchOnBlur: false,
        onSubmitSuccess: resetForm(FORM.CLOSE_BOND),
      }}
    >
      <Row>
        <Col span={24}>
          {props.bondStatusCode === "CON" && (
            <Field
              id="project_id"
              name="project_id"
              label="Project Id"
              required
              showTime
              component={RenderField}
              validate={[required]}
            />
          )}
          <Field
            id="closed_date"
            name="closed_date"
            label={`${bondStatusDescription} Date`}
            required
            showTime
            component={RenderDate}
            validate={[
              required,
              date,
              dateNotInFuture,
              dateNotBeforeOther(props.bond.issue_date),
            ]}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Field
            id="closed_note"
            name="closed_note"
            label={`${bondStatusDescription} Notes`}
            component={RenderAutoSizeField}
            validate={[maxLength(4000)]}
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
        >
          <Button className="full-mobile" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
          {props.title}
        </Button>
      </div>
    </FormWrapper>
  );
};

CloseBondForm.propTypes = propTypes;

export default CloseBondForm;
