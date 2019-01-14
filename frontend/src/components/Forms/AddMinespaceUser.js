import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderField from "@/components/common/RenderField";
import { Form, Button, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { required, email, phoneNumber, maxLength, number } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

export const AddMinespaceUser = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Col>
      <Row>
        <Field
          id="user_bceid_email"
          name="user_bceid_email"
          label="BCEID Email"
          component={RenderField}
          validate={[required, email]}
        />
        <Field
          id="proponent_mine_access"
          name="proponent_mine_access"
          label="Mines"
          placeholder="Please Select a Mine"
          component={renderConfig.MULTI_SELECT}
          data={[{ value: "1234", label: "1234" }]}
        />
      </Row>
    </Col>
  </Form>
);

AddMinespaceUser.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_MINESPACE_USER,
  initialValues: { proponent_mine_access: [] },
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_MINESPACE_USER),
})(AddMinespaceUser);
