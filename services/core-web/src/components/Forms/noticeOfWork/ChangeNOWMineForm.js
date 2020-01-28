import React from "react";
import PropTypes from "prop-types";
import { reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSelect: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export const ChangeNOWMineForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <RenderAutoComplete
            placeholder="Search for a mine by name"
            handleSelect={props.handleSelect}
            defaultValue={`${props.noticeOfWork.mine_name} - ${props.noticeOfWork.mine_no}`}
            data={props.data}
            handleChange={props.handleChange}
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
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

ChangeNOWMineForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CHANGE_NOW_MINE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.CHANGE_NOW_MINE),
})(ChangeNOWMineForm);
