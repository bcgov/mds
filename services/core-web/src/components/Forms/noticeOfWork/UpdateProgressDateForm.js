import React from "react";
import { Field, reduxForm } from "redux-form";
import { Button, Popconfirm, Row, Col } from "antd";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import PropTypes from "prop-types";
import { ClockCircleOutlined } from "@ant-design/icons";
import Highlight from "react-highlighter";
import { required, validateSelectOptions } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  title: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  delayTypeOptions: CustomPropTypes.options.isRequired,
  stage: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const UpdateprogressDateForm = (props) => {
  return (
    <div>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
       
            <Row gutter={16}>
      
              <Col span={24}>
                <Form.Item>
                  <Field
                    id="start_date"
                    name="start_date"
                    label="Start Date"
                    component={renderConfig.DATE}
                    validate={[required]}
                  />
                </Form.Item>
              </Col>
            </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="end_date"
                  name="end_date"
                  label="End Date"
                  component={renderConfig.DATE}
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
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Button htmlType="submit" type="primary">
              {props.title}
            </Button>
          </AuthorizationWrapper>
        </div>
      </Form>
    </div>
  );
};

UpdateprogressDateForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.UPDATE_PROGRESS_DATE_FORM,
  touchOnBlur: true,
})(UpdateprogressDateForm);
