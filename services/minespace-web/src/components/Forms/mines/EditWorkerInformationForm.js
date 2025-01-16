import React from "react";
import PropTypes from "prop-types";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import { Col, Row, Tooltip, Typography, Descriptions } from "antd";
import { Field } from "redux-form";
import { wholeNumber } from "@mds/common/redux/utils/Validate";
import { wholeNumberMask } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  handleToggleEdit: PropTypes.func.isRequired,
};

export const EditWorkerInformationForm = (props) => (
  <div className="work-information-container ">
    <FormWrapper
      name={FORM.EDIT_EMPLOYEE_COUNT}
      onSubmit={props.onSubmit}
      scrollOnToggleEdit={false}
      initialValues={props.initialValues}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
    >
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
              <Field
                id="number_of_mine_employees"
                name="number_of_mine_employees"
                component={renderConfig.FIELD}
                {...wholeNumberMask}
                validate={[wholeNumber]}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Number of Contractors">
              <Field
                id="number_of_contractors"
                name="number_of_contractors"
                component={renderConfig.FIELD}
                {...wholeNumberMask}
                validate={[wholeNumber]}
              />
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton cancelFunction={props.handleToggleEdit} />
        <RenderSubmitButton buttonText="Update Mine Worker Information" />
      </div>
    </FormWrapper>
  </div>
);

EditWorkerInformationForm.propTypes = propTypes;

export default EditWorkerInformationForm;
