import { IMineReportDefinition, IMineReportPermitRequirement, IPermitCondition } from "@mds/common/interfaces";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { useAppSelector } from "@mds/common/redux/rootState";
import { getPermitConditionCategories } from "@mds/common/redux/selectors/permitSelectors";
import { formatComplianceCodeReportName, formatDate } from "@mds/common/redux/utils/helpers";
import { transformPermitReportRequirement } from "@mds/common/utils/helpers";
import { Alert, Typography, Button, Row, Col, Collapse } from "antd";
import ExportOutlined from "@ant-design/icons/ExportOutlined";
import React, { FC } from "react";

export const CodeReportInfoBox: FC<{
  mineReportDefinition: IMineReportDefinition;
  verb: string;
}> = ({ mineReportDefinition, verb }) => {
  if (mineReportDefinition) {
    return (
      <div className="report-info-box">
        <div>
          {mineReportDefinition.is_prr_only && (
            <Alert
              showIcon
              description="Please submit this report as a permit required report."
              type="warning"
              className="margin-large--bottom"
            />
          )}
          <Typography.Title level={4} className="primary-colour">
            You are {verb}
          </Typography.Title>
          <Typography.Title level={5}>
            {formatComplianceCodeReportName(mineReportDefinition)}
          </Typography.Title>

          {mineReportDefinition.compliance_articles[0].long_description && (
            <>
              <Typography.Title level={5}>About this submission type:</Typography.Title>
              <Typography.Paragraph>
                {mineReportDefinition.compliance_articles[0].long_description}
              </Typography.Paragraph>
            </>
          )}
          {mineReportDefinition.compliance_articles[0].help_reference_link && (
            <Button
              target="_blank"
              rel="noopener noreferrer"
              href={mineReportDefinition.compliance_articles[0].help_reference_link}
              type="default"
            >
              More information <ExportOutlined />
            </Button>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const PermitReportInfoBox: FC<{
  summary?: boolean;
  twoColumn?: boolean;
  mineGuid: string;
  permitGuid: string;
  permitAmendmentGuid: string;
  permitReport: IMineReportPermitRequirement;
  verb: string;
}> = ({
  summary = false,
  twoColumn = false,
  permitReport,
  mineGuid,
  permitGuid,
  permitAmendmentGuid,
  verb,
}) => {
    const isCore = useAppSelector(getIsCore);
    const transformedReport = transformPermitReportRequirement(permitReport);
    const { conditionMap } = useAppSelector(
      getPermitConditionCategories(permitGuid, permitAmendmentGuid)
    );
    const conditions = permitReport?.permit_condition_ids.map((id) => conditionMap[id]).sort((a, b) => a.stepPath.localeCompare(b.stepPath))

    const getConditionHref = (condition: IPermitCondition) => {
      return GLOBAL_ROUTES?.VIEW_MINE_PERMIT_AMENDMENT.hashRoute(
        mineGuid,
        permitGuid,
        permitAmendmentGuid,
        "conditions",
        "#" + condition.condition_category_code
      ).toString();
    };

    if (transformedReport) {
      return (
        <div className={`${summary ? "report-summary-box" : "report-info-box"}`}>
          <div>
            <Typography.Title level={4} className="primary-colour">
              You are {verb}:
            </Typography.Title>
            <Typography.Title level={5}>{transformedReport.report_name}</Typography.Title>
            <div className="margin-large--bottom">
              <Typography.Title level={5}>Conditions:</Typography.Title>
              {conditions.map((condition) => (
                <Collapse
                  expandIconPosition="end"
                  className="light-header"
                  key={condition.permit_condition_id}
                >
                  <Collapse.Panel
                    key={condition.permit_condition_id}
                    header={<Typography.Text strong>{condition.stepPath}</Typography.Text>}
                  >
                    <Typography.Paragraph>{condition.condition}</Typography.Paragraph>
                    {isCore && <Button
                      key={condition.permit_condition_id}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={getConditionHref(condition)}
                      type="primary"
                    >
                      View In Permit <ExportOutlined />
                    </Button>}
                  </Collapse.Panel>
                </Collapse>
              ))}
            </div>
            <Row>
              <Col span={twoColumn ? 12 : 24}>
                <Typography.Title level={5}>Frequency:</Typography.Title>
                <Typography.Paragraph>{transformedReport.frequency}</Typography.Paragraph>

                <Typography.Title level={5}>Due Date:</Typography.Title>
                <Typography.Paragraph>
                  {transformedReport.initial_due_date
                    ? formatDate(transformedReport.initial_due_date)
                    : "Not Specified"}
                </Typography.Paragraph>
              </Col>
              <Col span={twoColumn ? 12 : 24}>
                <Typography.Title level={5}>Regulatory Authority:</Typography.Title>
                <Typography.Paragraph>{transformedReport.regulatory_authority}</Typography.Paragraph>

                <Typography.Title level={5}>Ministry Recipient:</Typography.Title>
                <Typography.Paragraph>{transformedReport.ministry_recipient}</Typography.Paragraph>
              </Col>
            </Row>
          </div>
        </div>
      );
    }
    return null;
  };
