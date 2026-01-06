import React, { FC } from "react";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ADD_REPORT_DEFINITION } from "@/constants/forms";
import { Col, Row, Typography } from "antd";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import { useAppSelector } from "@mds/common/redux/rootState";
import { getMineReportDueDateTypes } from "@mds/common/redux/slices/complianceReportsSlice";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { maxLength, required, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import { Field } from "@mds/common/components/forms/form";
import { IMineReportDefinition } from "@mds/common/interfaces";

const { Title, Paragraph } = Typography;

const AddReportDefinitionForm: FC<{
  handleSubmit?: (values: Partial<IMineReportDefinition>) => void | Promise<void>;
  isModal?: boolean;
  isEditMode?: boolean;
  initialValues?: Partial<IMineReportDefinition>;
}> = ({ handleSubmit, isModal = false, isEditMode = true, initialValues = {} }) => {
  const mineReportDueDateTypes = useAppSelector(getMineReportDueDateTypes);

  const dueDatePeriodMonthsOptions = [
    { label: "1 Month", value: 1 },
    { label: "12 Months", value: 12 },
    { label: "60 Months", value: 60 },
  ];

  return (
    <FormWrapper
      name={ADD_REPORT_DEFINITION}
      onSubmit={handleSubmit}
      isModal={isModal}
      isEditMode={isEditMode}
      initialValues={initialValues}
      reduxFormConfig={{ destroyOnUnmount: true }}
    >
      <Title level={3}>Report Details</Title>
      <Field
        required
        component={RenderField}
        name="report_name"
        label="Report Name"
        validate={[required, maxLength(100)]}
      />
      <Field
        required
        component={RenderAutoSizeField}
        name="description"
        label="Description"
        maximumCharacter={300}
        placeholder="Describe the report's definition / purpose for the mine proponent"
        validate={[required, maxLength(300)]}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Field
            required
            component={RenderSelect}
            data={mineReportDueDateTypes.map((type) => {
              return {
                value: type.mine_report_due_date_type,
                label: type.description,
              };
            })}
            name="mine_report_due_date_type_code"
            label="Due Date Type"
            validate={[required]}
          />
        </Col>
        <Col span={12}>
          <Field
            data={dueDatePeriodMonthsOptions}
            component={RenderSelect}
            name="mine_report_due_date_months"
            label="Due Date Period Months"
          />
        </Col>
      </Row>
      <Paragraph strong className="margin-small--bottom">
        Report Type
      </Paragraph>
      <Field
        required
        isVertical={true}
        component={RenderRadioButtons}
        name="report_type"
        label="What is the type of the report?"
        customOptions={[
          { label: `Code Required Report`, value: "CRR" },
          {
            label: (
              <div>
                <Paragraph className="margin-none">Permit Required Report</Paragraph>
                <Paragraph className="color-light-grey">
                  MineSpace users cannot submit this report in the Code Required section. An alert
                  will direct them to submit it through the Permit Required Report.
                </Paragraph>
              </div>
            ),
            value: "PRR",
          },
        ]}
        validate={[requiredRadioButton]}
      />

      <Field
        required
        component={RenderRadioButtons}
        name="is_common"
        label="Is this a common report"
        validate={[requiredRadioButton]}
      />

      <div className="ant-modal-footer">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Save Report" disableOnClean={false} />
      </div>
    </FormWrapper>
  );
};

export default AddReportDefinitionForm;
