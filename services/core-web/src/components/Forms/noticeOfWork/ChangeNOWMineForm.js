import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import RenderMineSelect from "@/components/common/RenderMineSelect";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const ChangeNOWMineForm = (props) => (
  <FormWrapper
    name={FORM.CHANGE_NOW_MINE}
    initialValues={props.initialValues}
    isModal
    reduxFormConfig={{
      touchOnBlur: false,
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
      <RenderCancelButton />
      <RenderSubmitButton buttonText={props.title} disableOnClean={false} />
    </div>
  </FormWrapper>
);

ChangeNOWMineForm.propTypes = propTypes;

export default ChangeNOWMineForm;
