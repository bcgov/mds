import React from "react";
import { Field } from "redux-form";
import { Button, Popconfirm, Row, Col } from "antd";
import PropTypes from "prop-types";
import { ClockCircleOutlined } from "@ant-design/icons";
import Highlight from "react-highlighter";
import { required } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  title: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  delayTypeOptions: CustomPropTypes.options.isRequired,
  stage: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const NOWDelayForm = (props) => {
  return (
    <div>
      <FormWrapper onSubmit={props.onSubmit}
        initialValues={props.initialValues}
        name={FORM.MANAGE_DELAY_FORM}
        reduxFormConfig={{
          touchOnBlur: true
        }}
      >
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
                <Field
                  id="delay_type_code"
                  name="delay_type_code"
                  label="Reason for Delay"
                  placeholder="Select a document type"
                  component={renderConfig.SELECT}
                  data={props.delayTypeOptions}
                  required
                  validate={[required]}
                />
              </Col>
              <Col span={24}>
                <Field
                  id="start_comment"
                  name="start_comment"
                  label="Comment"
                  component={renderConfig.AUTO_SIZE_FIELD}
                  required
                  validate={[required]}
                />
              </Col>
            </Row>
          </>
        ) : (
          <Row gutter={16}>
            <Col span={24}>
              <Field
                id="end_comment"
                name="end_comment"
                label="Comment"
                component={renderConfig.AUTO_SIZE_FIELD}
              />
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
      </FormWrapper>
    </div>
  );
};

NOWDelayForm.propTypes = propTypes;

export default NOWDelayForm;
