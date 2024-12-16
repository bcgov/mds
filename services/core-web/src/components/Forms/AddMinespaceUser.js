import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row } from "antd";
import { required, requiredList } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import RenderField from "@mds/common/components/forms/RenderField";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

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

export const AddMinespaceUser = (props) => (
  <FormWrapper
    name={FORM.ADD_MINESPACE_USER}
    onSubmit={props.handleSubmit}
    initialValues={{ proponent_mine_access: [] }}
    reduxFormConfig={{
      touchOnBlur: false,
      onSubmitSuccess: resetForm(FORM.ADD_MINESPACE_USER)
    }}
  >
    <Col span={24}>
      <Row>
        <Col span={24}>
          <Form.Item>
            <Field
              id="email_or_username"
              name="email_or_username"
              label="Email/BCeID username"
              placeholder="Please enter a bceid in the format of user@bceid or a valid email address"
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
              label="Mines"
              placeholder="Select the mines this user can access"
              component={renderConfig.MULTI_SELECT}
              data={props.mines}
              onChange={props.handleChange}
              onSearch={props.handleSearch}
              required
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
  </FormWrapper>
);

AddMinespaceUser.propTypes = propTypes;

export default AddMinespaceUser;
