import React from "react";
import { Col, Row, Typography, Alert } from "antd";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

export const IncidentGetStarted = () => {
  return (
    <Row>
      <Col span={16} offset={4}>
        <Typography.Title level={4}>
          Verbal notice of a reportable incident, within 4 hours
        </Typography.Title>
        <Typography.Paragraph>
          Reportable incidents that cause <b>serious injury</b> or <b>loss of life</b> must be{" "}
          <b>reported verbally to the Ministry within 4 hours</b> of the incident occurrence. (Mines
          code, section 1.7.1(1)(a))
        </Typography.Paragraph>
        <Typography.Paragraph>
          Call the <b>Mine Incident Reporting Line at </b>
          <a href="tel:1-888-348-0299">
            <b>1-888-348-0299</b>
          </a>{" "}
          . This line is monitored 24/7 by an On-call Inspector.
        </Typography.Paragraph>
        <Typography.Title level={4}>
          Written notice of a reportable incident, within 16 hours
        </Typography.Title>
        <Typography.Paragraph>
          All reportable incidents must be{" "}
          <b>reported in writing to the Ministry within 16 hours</b> of the incident occurrence.
          This includes a reportable incident that caused, or had the potential to cause, serious
          injury or loss of life, or is classified as a dangerous occurrence. (Mines code, section
          1.7.1(1)(b))
        </Typography.Paragraph>
        <Typography.Paragraph strong>
          Submitting a written notice of a reportable incident within MineSpace meets your mine’s
          written reporting responsibilities under the Ministry’s Incident Management Process
          Policy.
        </Typography.Paragraph>
        <Alert
          type="warning"
          description={
            <>
              <Typography.Paragraph>
                A written notice of a reportable incident received within 4-hours satisfies both the
                requirement for the verbal report and the written report.
              </Typography.Paragraph>
            </>
          }
          showIcon
        />
        <br />
        <Typography.Title level={5}>
          Do not disturb the scene of any reportable incident
        </Typography.Title>
        <Typography.Paragraph>
          The scene of a reportable incident must not be disturbed (e.g., to return to regular
          operations), except for the purpose of <b>saving life</b> or{" "}
          <b>relieving human suffering</b>. This is to preserve evidence for both the mine’s and the
          Ministry’s investigations. (Mines code, section 1.7.3)
        </Typography.Paragraph>
        <Typography.Paragraph>
          Only your OHSC worker representative or an inspector can release the scene.
        </Typography.Paragraph>
        <Typography.Title level={5}>
          After you complete your submission in MineSpace
        </Typography.Title>
        <Typography.Paragraph>
          Mines must investigate the reportable incident and prepare an <b>investigation report</b>{" "}
          to be submitted to an Inspector of Mines (Mines code, sections 1.7.1(4) & 1.7.2).
        </Typography.Paragraph>
        <Typography.Paragraph>
          After submitting your written notice of a reportable incident through MineSpace you are
          required to come back to your submission and add your investigation report.
        </Typography.Paragraph>
        <br />
      </Col>
    </Row>
  );
};

// ENV FLAG FOR MINE INCIDENTS //
export default AuthorizationGuard(Permission.IN_TESTING)(IncidentGetStarted);
