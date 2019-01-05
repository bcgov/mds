import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required, validateStartDate, validSearchSelection } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.objectOf(CustomPropTypes.party),
  partyIds: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.shape({ startDate: PropTypes.string }),
};

const defaultProps = {
  parties: {},
  partyIds: [],
  initialValues: {},
};

const validMineManager = validSearchSelection({ key: "parties", err: "Invalid Mine Manager" });

export const UpdateMineManagerForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="mineManager"
            name="mineManager"
            label="Mine Manager *"
            placeholder="Search for a Mine Manager"
            component={renderConfig.LARGE_SELECT}
            data={props.partyIds}
            options={props.parties}
            validate={[required, validMineManager]}
            handleChange={props.handleChange}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="startDate"
            name="startDate"
            label="Select a Start date *"
            placeholder="yyyy-mm-dd"
            component={renderConfig.DATE}
            validate={[required, validateStartDate(props.initialValues.startDate)]}
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
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit">
        {props.title}
      </Button>
    </div>
  </Form>
);

UpdateMineManagerForm.propTypes = propTypes;
UpdateMineManagerForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.UPDATE_MINE_MANAGER,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.UPDATE_MINE_MANAGER),
})(UpdateMineManagerForm);
