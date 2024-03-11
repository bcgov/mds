import React, { FC } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { Alert, Button, Col, Row, Typography } from "antd";
import { FORM, IMineReport, MINE_REPORT_SUBMISSION_CODES, REPORT_TYPE_CODES } from "@mds/common";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { required, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import { getFormattedMineReportDefinitionOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderDate from "@mds/common/components/forms/RenderDate";
import { RenderPRRFields } from "@mds/common/components/reports/ReportGetStarted";

interface RequestReportFormProps {
  onSubmit: (values: Partial<IMineReport>) => void | Promise<void>;
  mineReportsType: REPORT_TYPE_CODES;
  mineGuid: string;
}
export const RequestReportForm: FC<RequestReportFormProps> = ({
  onSubmit,
  mineReportsType,
  mineGuid,
}) => {
  const mineReportDefinitionOptions = useSelector(getFormattedMineReportDefinitionOptions);

  return (
    <div>
      <FormWrapper
        name={FORM.REQUEST_REPORT}
        onSubmit={onSubmit}
        isModal={true}
        initialValues={{
          mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Typography.Paragraph strong>Select Report Type</Typography.Paragraph>
          </Col>
          {mineReportsType === REPORT_TYPE_CODES.CRR && (
            <Col span={24}>
              <Field
                name="mine_report_definition_guid"
                label="Search by Code Section or Report Name"
                placeholder="placeholder!"
                required
                validate={[required]}
                component={RenderSelect}
                data={mineReportDefinitionOptions}
              />
            </Col>
          )}
          {mineReportsType === REPORT_TYPE_CODES.PRR && <RenderPRRFields mineGuid={mineGuid} />}
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
        </Row>
        <Row justify="end">
          <Button type="default">Cancel</Button>
          <Button type="primary" htmlType="submit">
            Request Report
          </Button>
        </Row>
      </FormWrapper>
    </div>
  );
};
