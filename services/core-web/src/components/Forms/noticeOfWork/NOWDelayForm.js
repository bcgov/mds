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

const NOWDelayForm = (props) => {
  return (
    <div>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        {props.stage === "Start" ? (
          <>
            <p>
              Setting this application to <Highlight search="Delayed">Delayed</Highlight> means that
              no work can proceed until the issue is resolved.
            </p>
            <br />
            <p>
              No changes or additions to the application can be made while it is{" "}
              <Highlight search="Delayed">Delayed</Highlight>.
            </p>
            <br />
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item>
                  <Field
                    id="delay_type_code"
                    name="delay_type_code"
                    label="Reason for Delay*"
                    placeholder="Select a document type"
                    component={renderConfig.SELECT}
                    data={props.delayTypeOptions}
                    validate={[required, validateSelectOptions(props.delayTypeOptions)]}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Field
                    id="start_comment"
                    name="start_comment"
                    label="Comment"
                    component={renderConfig.AUTO_SIZE_FIELD}
                    validate={[required]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Field
                  id="end_comment"
                  name="end_comment"
                  label="Comment"
                  component={renderConfig.AUTO_SIZE_FIELD}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
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
            <Button htmlType="submit" type="danger">
              <ClockCircleOutlined />
              {props.title}
            </Button>
          </AuthorizationWrapper>
        </div>
      </Form>
    </div>
  );
};

NOWDelayForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.MANAGE_DELAY_FORM,
  touchOnBlur: true,
})(NOWDelayForm);
