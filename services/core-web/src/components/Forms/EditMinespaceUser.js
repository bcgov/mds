import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import { requiredList } from "@common/utils/Validate";
import { nullableStringSorter, resetForm } from "@common/utils/helpers";
import RenderField from "@/components/common/RenderField";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mines: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
};

export const EditMinespaceUser = (props) => {
  const { mines, handleSubmit, handleChange, handleSearch } = props;
  const isModal = true; // currently no instance where it's not in a modal
  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
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
                data={mines.sort(nullableStringSorter("label"))}
                onChange={handleChange}
                onSearch={handleSearch}
                validate={[requiredList]}
                props={{ isModal }}
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
};

EditMinespaceUser.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_MINESPACE_USER,
  initialValues: { proponent_mine_access: [] },
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_MINESPACE_USER),
})(EditMinespaceUser);
