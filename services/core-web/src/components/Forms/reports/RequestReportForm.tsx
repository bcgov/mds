import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Button, Col, Form, Row, Typography } from "antd";
import {
  FORM,
  IMineReport,
  IMineReportDefinition,
  MINE_REPORT_SUBMISSION_CODES,
  REPORT_TYPE_CODES,
} from "@mds/common";
import { required, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import AntdFormWrapper from "@mds/common/components/forms/AntdFormWrapper";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import {
  getFormattedMineReportDefinitionOptions,
  getMineReportDefinitionByGuid,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { RenderPRRFields, ReportInfoBox } from "@mds/common/components/reports/ReportGetStarted";
import FormField from "@mds/common/components/forms/FormField";
import { isMoment } from "moment";
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

  const [form] = Form.useForm();
  const mine_report_definition_guid = Form.useWatch('mine_report_definition_guid', form);

  const selectedReportDefinition: IMineReportDefinition = useSelector(
    getMineReportDefinitionByGuid(mine_report_definition_guid)
  );

  return (
    <div style={{ minHeight: "380px" }}>
      <AntdFormWrapper
        form={form}
        name={FORM.REQUEST_REPORT}
        onSubmit={val => {
          return onSubmit({
            ...val,
            due_date: isMoment(val.due_date) ? val.due_date.format("YYYY-MM-DD") : val.due_date,
            submission_year: isMoment(val.submission_year) ? val.submission_year.format("YYYY") : val.submission_year,
          });
        }}
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
              <FormField
                name="mine_report_definition_guid"
                label="Search by Code Section or Report Name"
                placeholder="Enter a code section or report name"
                required={true}
                validate={[required]}
                component={RenderSelect}
                data={mineReportDefinitionOptions}
              />
            </Col>
          )}
          {mineReportsType === REPORT_TYPE_CODES.PRR && (
            <RenderPRRFields mineGuid={mineGuid} fullWidth />
          )}
          <Col md={12} sm={24}>
            <FormField
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
            <FormField
              name="due_date"
              label="Due Date"
              placeholder="Select date"
              required
              validate={[required]}
              component={RenderDate}
            />
          </Col>
          {selectedReportDefinition && (
            <Col span={24}>
              <ReportInfoBox mineReportDefinition={selectedReportDefinition} verb="requesting" />
            </Col>
          )}
        </Row>
        <Row justify="end">
          <RenderCancelButton />
          <Button type="primary" htmlType="submit">
            Request Report
          </Button>
        </Row>
      </AntdFormWrapper>
    </div>
  );
};
