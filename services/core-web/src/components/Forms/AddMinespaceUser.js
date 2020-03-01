import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import { required, email, requiredList } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import RenderField from "@/components/common/RenderField";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  mines: CustomPropTypes.options.isRequired,
  handleChange: PropTypes.func,
  handleSearch: PropTypes.func,
};

const defaultProps = {
  handleChange: () => {},
  handleSearch: () => {},
};

export const AddMinespaceUser = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Col>
      <Row>
        <Col>
          <Form.Item>
            <Field
              id="user_bceid_email"
              name="user_bceid_email"
              label="Email*"
              placeholder="Enter the user's BCeID email"
              component={RenderField}
              validate={[required, email]}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Field
              id="proponent_mine_access"
              name="proponent_mine_access"
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
          Create Proponent
        </Button>
      </div>
    </Col>
  </Form>
);

AddMinespaceUser.propTypes = propTypes;
AddMinespaceUser.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_MINESPACE_USER,
  initialValues: { proponent_mine_access: [] },
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_MINESPACE_USER),
})(AddMinespaceUser);
