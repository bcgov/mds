import { Col, Form, Input, Row, Typography } from "antd";
import React from "react";
import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import { Link } from "react-router-dom";

const stubbedCommonReports = [
  {
    reportName: "Annual Reclamation Report",
    reportLink: "",
  },
  {
    reportName: "Annual Summary of Exploration Activities",
    reportLink: "",
  },
  {
    reportName: "Annual Summary of Placer Activities",
    reportLink: "",
  },
  {
    reportName: "Annual Summary of Work and Reclamation Report",
    reportLink: "",
  },
  {
    reportName: "Annual Dam Safety Inspection (DSI)",
    reportLink: "",
  },
  {
    reportName: "ITRB Activities Report",
    reportLink: "",
  },
  {
    reportName: "Mine Emergency Response Plan",
    reportLink: "",
  },
  {
    reportName: "Multi-Year Area Based Permit Updates",
    reportLink: "",
  },
  {
    reportName: "Notification To Start",
    reportLink: "",
  },
  {
    reportName: "Notification To Stop",
    reportLink: "",
  },
];

const ReportGetStarted = () => {
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
      <Row>
        <Col span={12}>
          <Typography.Paragraph strong className="margin-large--top">
            Report Code Requirement
          </Typography.Paragraph>
          <Form layout="vertical">
            <Form.Item label="Enter Code Section">
              <Input placeholder="10.4.1" />
            </Form.Item>
          </Form>
          <Typography.Paragraph strong className="margin-large--top">
            Common Reports
          </Typography.Paragraph>
          {stubbedCommonReports.map((report) => (
            <Link to={report.reportLink} key={report.reportName} className="report-link">
              <Row gutter={16}>
                <Col>
                  <Typography.Text>{report.reportName}</Typography.Text>
                </Col>
                <Col>
                  <ArrowRightOutlined />
                </Col>
              </Row>
            </Link>
          ))}
        </Col>
      </Row>
    </div>
  );
};

export default ReportGetStarted;
