import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import { required, requiredList } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import RenderField from "@/components/common/RenderField";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import { compose } from "redux";
import { connect } from "react-redux";

const propTypes = {
  mines: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  minespaceUserEmailHash: PropTypes.objectOf(PropTypes.any).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
};

const minespaceUserNotExists = (value, allValues, props) =>
  value && !(value in props.minespaceUserEmailHash)
    ? undefined
    : "A user with this email already exists";

export const EditMinespaceUser = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Col span={24}>
      <Row>
        <Col span={24}>
          <Form.Item>
            <Field
              id="email_or_username"
              name="email_or_username"
              label="Email/BCeID username"
              placeholder="Enter the users Email (BCeID username if email is not available)"
              component={RenderField}
              validate={[required, minespaceUserNotExists]}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item>
            <Field
              id="mine_guids"
              name="mine_guids"
              label="Mines*"
              placeholder="Select the mines this user can access"
              component={renderConfig.MULTI_SELECT}
              data={props.mines}
              onChange={props.handleChange}
              onSearch={props.handleSearch}
              validate={[requiredList]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Button className="full-mobile" type="primary" htmlType="submit">
          Edit Proponent
        </Button>
      </div>
    </Col>
  </Form>
);

EditMinespaceUser.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.EDIT_MINESPACE_USER)(state) || {},
});

export default reduxForm({
  form: FORM.EDIT_MINESPACE_USER,
  initialValues: { proponent_mine_access: [] },
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_MINESPACE_USER),
})(EditMinespaceUser);

// export default compose(
//   connect(mapStateToProps),

//   reduxForm({
//     form: FORM.EDIT_MINESPACE_USER,
//     initialValues: { mine_guids: [], email_or_username: "foo@foo.com" },
//     touchOnBlur: true,

//     touchOnChange: false,

//     onSubmit: () => {},
//   })
// )(EditMinespaceUser);
