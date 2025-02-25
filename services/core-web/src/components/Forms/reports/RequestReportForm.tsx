import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { Button, Col, Row, Typography } from "antd";
import { required, yearNotInFuture } from "@mds/common/redux/utils/Validate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { getFormattedMineReportDefinitionOptions, getMineReportDefinitionByGuid } from "@mds/common/redux/slices/complianceReportsSlice";
import { PermitReportInfoBox, RenderPRRFields, CodeReportInfoBox } from "@mds/common/components/reports/ReportGetStarted";
import { IMineReport, IMineReportDefinition, IMineReportSubmission } from "@mds/common/interfaces";
import { MINE_REPORT_SUBMISSION_CODES, REPORT_TYPE_CODES } from "@mds/common/constants/enums";
import { FORM } from "@mds/common/constants/forms";
import { getLatestAmendmentByPermitGuid, getMineReportPermitRequirementById, getPermitConditionCategories } from "@mds/common/redux/selectors/permitSelectors";

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
  const formValues = useSelector(getFormValues(FORM.REQUEST_REPORT)) as IMineReportSubmission;
  const selectedCodeReportDefinition: IMineReportDefinition = useSelector(
    getMineReportDefinitionByGuid(formValues?.mine_report_definition_guid)
  );
  const selectedPermitReportDefinition = useSelector(
    getMineReportPermitRequirementById(formValues?.permit_guid,formValues?.mine_report_permit_requirement_id)
  )
  const latestAmendment = useSelector(getLatestAmendmentByPermitGuid(formValues?.permit_guid));

  return (
    <div style={{ minHeight: "380px" }}>
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
                placeholder="Enter a code section or report name"
                required
                validate={[required]}
                component={RenderSelect}
                data={mineReportDefinitionOptions}
              />
            </Col>
          )}
          {mineReportsType === REPORT_TYPE_CODES.PRR && (
            <RenderPRRFields summary mineGuid={mineGuid} fullWidth formName={FORM.REQUEST_REPORT} />
          )}
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
          {selectedCodeReportDefinition && (
            <Col span={24}>
              <CodeReportInfoBox mineReportDefinition={selectedCodeReportDefinition} verb="requesting" />
            </Col>
          )}
          {selectedPermitReportDefinition && (
            <Col span={24} className="margin-large--bottom">
              <PermitReportInfoBox
                twoColumn
                mineGuid={mineGuid}
                permitGuid={formValues?.permit_guid}
                permitAmendmentGuid={latestAmendment?.permit_amendment_guid}
                permitReport={selectedPermitReportDefinition}
                verb="requesting" 
              />
            </Col>
          )}
        </Row>
        <Row justify="end">
          <RenderCancelButton />
          <Button type="primary" htmlType="submit">
            Request Report
          </Button>
        </Row>
      </FormWrapper>
    </div>
  );
};
