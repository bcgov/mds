import React, { FC } from "react";
import { Field } from "redux-form";
import { Button, Col, Row, Typography } from "antd";
import {
  FORM,
  IMineReport,
  IPermitCondition,
  MINE_REPORT_SUBMISSION_CODES,
  REPORT_FREQUENCY_HASH,
  REPORT_OFFICE_DESTINATION_HASH,
  REPORT_REGULATORY_AUTHORITY_CODES_HASH,
  REPORT_TYPE_CODES,
} from "@mds/common";
import { required, requiredList, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import { requiredRadioButton } from "@common/utils/Validate";
import RenderGroupCheckbox, {
  normalizeGroupCheckBox,
} from "@mds/common/components/forms/RenderGroupCheckbox";

interface RequestReportFormProps {
  onSubmit: (values: Partial<IMineReport>) => void | Promise<void>;
  permitGuid: string;
  condition: IPermitCondition;
  modalView?: boolean;
}

export const AddRequestToPermitConditionForm: FC<RequestReportFormProps> = ({
  onSubmit,
  condition,
  permitGuid,
  modalView = true,
}) => {
  const report = condition?.report;
  const [isEditMode, setIsEditMode] = React.useState(modalView);

  return (
    <div style={{ minHeight: modalView ? "380px" : "" }}>
      <FormWrapper
        name={FORM.ADD_REPORT_TO_PERMIT_CONDITION}
        onSubmit={onSubmit}
        isModal={modalView}
        isEditMode={isEditMode}
        scrollOnToggleEdit={false}
        initialValues={
          report
            ? { ...report, stepPath: condition.stepPath }
            : {
                mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON,
                condition: condition.stepPath,
                permit_condition_category_code: condition.condition_category_code,
                permit_condition_type_code: REPORT_TYPE_CODES.PRR,
                permit_condition_id: condition.permit_condition_id,
                permit_guid: permitGuid,
              }
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Field
              name="stepPath"
              label="Condition"
              required
              validate={required}
              component={RenderField}
              disabled
            />
          </Col>
          <Col span={12}>
            <Field
              name="frequency"
              label="Report Frequency"
              required
              validate={[required]}
              component={RenderSelect}
              data={Object.keys(REPORT_FREQUENCY_HASH).map((key) => {
                return {
                  value: key,
                  label: REPORT_FREQUENCY_HASH[key],
                };
              })}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              name="submission_year"
              label="Report Compliance Year/Period"
              placeholder="Select year"
              required
              validate={[required, yearNotInFuture]}
              component={RenderDate}
              props={{
                yearMode: true,
                disabledDate: (currentDate) => currentDate.isAfter(),
              }}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              name="due_date"
              label="Due Date"
              placeholder="Select date"
              required
              validate={[required]}
              component={RenderDate}
            />
          </Col>
          <Col md={12} sm={24}>
            {!modalView && !isEditMode ? (
              <div>
                <Typography.Paragraph strong className="margin-none">
                  Regulatory Authority
                </Typography.Paragraph>
                <Typography.Paragraph>
                  {REPORT_REGULATORY_AUTHORITY_CODES_HASH[report.cim_or_cpo]}
                </Typography.Paragraph>
              </div>
            ) : (
              <Field
                name="cim_or_cpo"
                label="Who is the report for?"
                required
                customOptions={Object.keys(REPORT_REGULATORY_AUTHORITY_CODES_HASH).map((key) => {
                  return {
                    value: key,
                    label: REPORT_REGULATORY_AUTHORITY_CODES_HASH[key],
                  };
                })}
                vertical
                validate={[requiredRadioButton]}
                component={RenderRadioButtons}
              />
            )}
          </Col>
          <Col md={12} sm={24}>
            {!modalView && !isEditMode ? (
              <div>
                <Typography.Paragraph strong className="margin-none">
                  Ministry Recipient
                </Typography.Paragraph>
                <Typography.Paragraph>
                  {report.office_destination.map(
                    (dest) => `${REPORT_OFFICE_DESTINATION_HASH[dest]}, `
                  )}
                </Typography.Paragraph>
              </div>
            ) : (
              <Field
                name="office_destination"
                label="What office is the report for?"
                validate={[requiredList]}
                normalize={normalizeGroupCheckBox}
                component={RenderGroupCheckbox}
                options={Object.keys(REPORT_OFFICE_DESTINATION_HASH).map((key) => {
                  return {
                    value: key,
                    label: REPORT_OFFICE_DESTINATION_HASH[key],
                  };
                })}
              />
            )}
          </Col>
        </Row>
        <Row justify="end">
          {isEditMode ? (
            <div>
              <RenderCancelButton
                cancelFunction={!modalView ? () => setIsEditMode(false) : undefined}
              />
              <Button type="primary" htmlType="submit">
                {report ? "Update" : "Add"} Report
              </Button>
            </div>
          ) : (
            <Button
              type="primary"
              onClick={(event) => {
                event.preventDefault();
                setIsEditMode(true);
              }}
            >
              Edit Report
            </Button>
          )}
        </Row>
      </FormWrapper>
    </div>
  );
};
