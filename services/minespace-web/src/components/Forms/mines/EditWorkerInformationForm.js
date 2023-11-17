import React from "react";
import PropTypes from "prop-types";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Popconfirm, Row, Tooltip, Typography, Descriptions } from "antd";

import { Field, reduxForm } from "redux-form";
import { wholeNumber } from "@common/utils/Validate";
import { wholeNumberMask } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  handleToggleEdit: PropTypes.func.isRequired,
};

export const EditWorkerInformationForm = (props) => (
  <div className="work-information-container ">
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Typography.Title level={4}>
        Worker Information
        <Tooltip
          overlayClassName="minespace-tooltip"
          title="Approximate number of workers on site that includes mine employees and contractors."
          placement="right"
          mouseEnterDelay={0.3}
        >
          <InfoCircleOutlined className="padding-sm" />
        </Tooltip>
      </Typography.Title>
      <Row gutter={16}>
        <Col span={22}>
          <Descriptions column={5} colon={false}>
            <Descriptions.Item label="Number of Mine Employees">
              <Form.Item>
                <Field
                  id="number_of_mine_employees"
                  name="number_of_mine_employees"
                  component={renderConfig.FIELD}
                  {...wholeNumberMask}
                  validate={[wholeNumber]}
                />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item label="Number of Contractors">
              <Form.Item>
                <Field
                  id="number_of_contractors"
                  name="number_of_contractors"
                  component={renderConfig.FIELD}
                  {...wholeNumberMask}
                  validate={[wholeNumber]}
                />
              </Form.Item>
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={(event) => {
            props.handleToggleEdit(event);
          }}
          okText="Yes"
          cancelText="No"
          disabled={props.submitting}
        >
          <Button className="full-mobile margin-small" type="secondary" disabled={props.submitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button
          className="full-mobile margin-small"
          type="primary"
          htmlType="submit"
          loading={props.submitting}
          disabled={props.submitting}
        >
          Update Mine Worker Information
        </Button>
      </div>
    </Form>
  </div>
);

EditWorkerInformationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_EMPLOYEE_COUNT,
  touchOnBlur: false,
  enableReinitialize: true,
})(EditWorkerInformationForm);
