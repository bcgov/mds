import React, { FC } from "react";
import { Field } from "redux-form";
import { Button, Col, Row, Typography } from "antd";
import { useSelector } from "react-redux";
import {
  IMineReport,
  IMineReportPermitRequirement,
  IPermitCondition,
} from "@mds/common/interfaces";

import { required, requiredRadioButton, maxLength } from "@mds/common/redux/utils/Validate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderGroupCheckbox, {
  normalizeGroupCheckBox,
} from "@mds/common/components/forms/RenderGroupCheckbox";
import { getLatestAmendmentByPermitGuid } from "@mds/common/redux/selectors/permitSelectors";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import { FORM } from "@mds/common/constants/forms";
import { MINE_REPORT_SUBMISSION_CODES, REPORT_TYPE_CODES } from "@mds/common/constants/enums";
import { REPORT_FREQUENCY_HASH, REPORT_MINISTRY_RECIPIENT_HASH, REPORT_REGULATORY_AUTHORITY_CODES_HASH } from "@mds/common/constants/strings";

interface ReportPermitRequirementProps {
  onSubmit: (values: Partial<IMineReport>) => void | Promise<void>;
  permitGuid: string;
  condition: IPermitCondition;
  modalView?: boolean;
  mineReportPermitRequirement?: IMineReportPermitRequirement;
}

export const ReportPermitRequirementForm: FC<ReportPermitRequirementProps> = ({
  onSubmit,
  condition,
  permitGuid,
  modalView = true,
  mineReportPermitRequirement,
}) => {
  const [isEditMode, setIsEditMode] = React.useState(modalView);
  const latestPermitAmendment = useSelector(getLatestAmendmentByPermitGuid(permitGuid));

  return (
    <div style={{ minHeight: modalView ? "380px" : "" }}>
      <FormWrapper
        name={`${FORM.ADD_REPORT_TO_PERMIT_CONDITION}-${condition.permit_condition_id}`}
        onSubmit={onSubmit}
        isModal={modalView}
        isEditMode={isEditMode}
        scrollOnToggleEdit={false}
        initialValues={
          mineReportPermitRequirement
            ? {
              ...mineReportPermitRequirement,
              stepPath: condition.stepPath,
              permit_amendment_id: latestPermitAmendment.permit_amendment_id,
            }
            : {
              mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON,
              stepPath: condition.stepPath,
              permit_condition_category_code: condition.condition_category_code,
              permit_condition_type_code: REPORT_TYPE_CODES.PRR,
              permit_condition_id: condition.permit_condition_id,
              permit_guid: permitGuid,
              permit_amendment_id: latestPermitAmendment.permit_amendment_id,
            }
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Field
              name="stepPath"
              label="Condition"
              required
              validate={required}
              component={RenderField}
              disabled
            />
          </Col>
          <Col span={24}>
            <Field
              name="report_name"
              label="Report Type"
              validate={[maxLength(255)]}
              component={RenderField}
            />
          </Col>
          <Col span={12}>
            <Field
              name="due_date_period_months"
              label="Report Frequency"
              required
              validate={[required]}
              component={RenderSelect}
              data={Object.keys(REPORT_FREQUENCY_HASH).map((key) => {
                return {
                  value: REPORT_FREQUENCY_HASH[key],
                  label: key,
                };
              })}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              name="initial_due_date"
              label="Initial Due Date"
              placeholder="Select date"
              formatViewDate
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
                  {mineReportPermitRequirement.cim_or_cpo
                    ? REPORT_REGULATORY_AUTHORITY_CODES_HASH[mineReportPermitRequirement.cim_or_cpo]
                    : "Not Specified"}
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
                isVertical
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
                  {mineReportPermitRequirement.ministry_recipient?.map(
                    (dest, index) =>
                      `${REPORT_MINISTRY_RECIPIENT_HASH[dest]}${index < mineReportPermitRequirement.ministry_recipient.length - 1 ? ", " : ""} `
                  ) ?? "None Specified"}
                </Typography.Paragraph>
              </div>
            ) : (
              <Field
                name="ministry_recipient"
                label="What office is the report for?"
                normalize={normalizeGroupCheckBox}
                component={RenderGroupCheckbox}
                options={Object.keys(REPORT_MINISTRY_RECIPIENT_HASH).map((key) => {
                  return {
                    value: key,
                    label: REPORT_MINISTRY_RECIPIENT_HASH[key],
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
                {mineReportPermitRequirement ? "Update" : "Add"} Report
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

export default ReportPermitRequirementForm;
