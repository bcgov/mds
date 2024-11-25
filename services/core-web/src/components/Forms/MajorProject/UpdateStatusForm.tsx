import React, { FC } from "react";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { IOption, MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES, PROJECT_STATUS_CODES } from "@mds/common";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import ProjectCallout from "@mds/common/components/projects/ProjectCallout";

interface UpdateStatusFormProps {
  displayValues: {
    status_code: MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES | PROJECT_STATUS_CODES,
    update_user: string,
    updateDate: string,
  };
  dropdownOptions: IOption[];
  handleSubmit: (values) => Promise<void>;
  formName: string;
}

const UpdateStatusForm: FC<UpdateStatusFormProps> = ({
  displayValues,
  handleSubmit,
  formName,
  dropdownOptions
}) => {

  return (
    <FormWrapper
      name={formName}
      onSubmit={handleSubmit}
      initialValues={displayValues}
      reduxFormConfig={{
        enableReinitialize: true
      }}
    >
      <Row>
        <Col span={24}>
          <ProjectCallout
            status_code={displayValues.status_code}
            formField={<>
              <Field
                id="status_code"
                name="status_code"
                label=""
                placeholder="Action"
                component={RenderSelect}
                validate={[required]}
                data={dropdownOptions}
                allowClear={false}
              />
              <RenderSubmitButton buttonText="Update Status" />
            </>}
          />
        </Col>
      </Row>
    </FormWrapper>
  )
};

export default UpdateStatusForm;