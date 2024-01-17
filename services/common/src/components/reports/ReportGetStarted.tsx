import { Button, Col, Form, Row, Select, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import { useSelector } from "react-redux";
import { IMineReportDefinition } from "@mds/common/interfaces";
import { getMineReportDefinitionOptions } from "@mds/common/redux/reducers/staticContentReducer";
import { formatComplianceCodeReportName } from "@mds/common/redux/utils/helpers";
import { uniqBy } from "lodash";

interface ReportGetStartedProps {
  setSelectedReportDefinition: (report: IMineReportDefinition) => void;
  selectedReportDefinition: IMineReportDefinition;
}

const ReportGetStarted: FC<ReportGetStartedProps> = ({
  setSelectedReportDefinition,
  selectedReportDefinition,
}) => {
  const [commonReportDefinitionOptions, setCommonReportDefinitionOptions] = useState([]);
  const [formattedMineReportDefinitionOptions, setFormattedMineReportDefinitionOptions] = useState(
    []
  );

  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);

  useEffect(() => {
    // Format the mine report definition options for the search bar
    const newFormattedMineReportDefinitionOptions = mineReportDefinitionOptions
      .map((report) => {
        return {
          label: formatComplianceCodeReportName(report),
          value: report.mine_report_definition_guid,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    setFormattedMineReportDefinitionOptions(
      uniqBy(newFormattedMineReportDefinitionOptions, "value")
    );

    // Filter out common reports and sort alphabetically
    const commonReportDefinitions = mineReportDefinitionOptions
      .filter((report) => report.is_common)
      .sort((a, b) => a.report_name.localeCompare(b.report_name));
    setCommonReportDefinitionOptions(commonReportDefinitions);
  }, [mineReportDefinitionOptions]);

  const handleChange = (newValue: string) => {
    // Set the selected report definition to be displayed and used in the next step
    const newReport = mineReportDefinitionOptions.find(
      (report) => report.mine_report_definition_guid === newValue
    );
    setSelectedReportDefinition(newReport);
  };

  return (
    <div>
      <Typography.Title level={3}>Getting Started with your Report Submission</Typography.Title>
      <Typography.Paragraph>
        The Province is committed to ensuring that B.C. remains a leader in mining regulation and
        oversight, while enhancing responsible resource development and strengthening First Nations
        involvement in the B.C.&apos;s mining sector. Find more guidance and related documents{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/health-safety-and-reclamation-code-for-mines-in-british-columbia/health-safety-reclamation-code-guidance?keyword=code&keyword=required&keyword=report"
        >
          here
        </a>
        .
      </Typography.Paragraph>
      <Typography.Title level={5}>
        Enter code section or choose from the submission list or select report type in the next
        step.
      </Typography.Title>
      <Typography.Paragraph>
        Quickly select a common report type or select another report type on the report details
        screen.
      </Typography.Paragraph>
      <Row gutter={24} className="margin-large--bottom">
        <Col span={12}>
          <div className="light-grey-border padding-md--sides">
            <Typography.Paragraph strong className="margin-large--top">
              Report Code Requirement
            </Typography.Paragraph>
            <Form layout="vertical">
              <Form.Item label="Enter Code Section">
                <Select
                  showSearch
                  onChange={handleChange}
                  filterOption={(input, option) =>
                    (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                  }
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  placeholder="10.4.1"
                  options={formattedMineReportDefinitionOptions}
                />
              </Form.Item>
            </Form>
            <Typography.Paragraph strong className="margin-large--top">
              Common Reports
            </Typography.Paragraph>
            {commonReportDefinitionOptions.map((report) => (
              <Row key={report.report_name}>
                <Col span={24}>
                  <Button
                    onClick={() => setSelectedReportDefinition(report)}
                    type="text"
                    className="report-link"
                  >
                    <Typography.Text>{report.report_name}</Typography.Text>
                    <span className="margin-large--left">
                      <ArrowRightOutlined />
                    </span>
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        </Col>
        <Col span={12}>
          <div className="report-info-box">
            {selectedReportDefinition && (
              <div>
                <Typography.Title level={4}>You are submitting</Typography.Title>
                <Typography.Title level={5}>
                  {formatComplianceCodeReportName(selectedReportDefinition)}
                </Typography.Title>
                <Typography.Paragraph>{selectedReportDefinition.description}</Typography.Paragraph>
                <Typography.Paragraph>
                  TODO: Add plain language long description to reports
                </Typography.Paragraph>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ReportGetStarted;
