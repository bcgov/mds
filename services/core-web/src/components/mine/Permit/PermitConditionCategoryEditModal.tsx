import React, { FC } from "react";
import { Col, Form, Row } from "antd";
import { FORM } from "@mds/common/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { Field } from "redux-form";
import { maxLength, required } from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import PermitConditionCategorySelector from "./PermitConditionCategorySelector";

interface PermitConditionCategoryEditModalProps {
  handleSubmit(category: IPermitConditionCategory): Promise<void>;
}

const PermitConditionCategoryEditModal: FC<PermitConditionCategoryEditModalProps> = ({ handleSubmit }) => {
  return (
    <FormWrapper name={FORM.ADD_PERMIT_CONDITION_CATEGORY} isModal onSubmit={handleSubmit}>
      <Row gutter={6}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="step"
              name="step"
              label="Category Reference Number"
              validate={[required, maxLength(2)]}
              required
              component={RenderField}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <PermitConditionCategorySelector />
        </Col>
      </Row>

      <div className="ant-modal-footer">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Add Category" disableOnClean={false} />
      </div>
    </FormWrapper>
  );
};

export default PermitConditionCategoryEditModal;
