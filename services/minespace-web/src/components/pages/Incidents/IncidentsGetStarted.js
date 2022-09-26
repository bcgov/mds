import React from "react";
import { Col, Row, Typography, Alert } from "antd";

export const IncidentsGetStarted = () => {
  return (
    <Row>
      <Col style={{ marginLeft: "15%" }}>
        <Typography.Title level={3}>Dangerous Occurence Reporting</Typography.Title>
        <Typography.Paragraph>
          You are required to report all dangerous Occurrence, pursuant to section 1.7.3 of the Code
          (including serious injuries).
        </Typography.Paragraph>
        <Typography.Title level={4}>
          Reporting a dangerous occurence through MineSpace
        </Typography.Title>
        <Typography.Paragraph>
          Mines must submit an initial report of the Dangerous Occurrence within 16 hours, pursuant
          to 1.7.1(1)(b) of the Code.
        </Typography.Paragraph>
        <Typography.Title level={4}>
          After you complete your submission in minespace
        </Typography.Title>
        <Typography.Paragraph>
          Mines must investigate the Dangerous Occurrence and prepare a report to be submitted to an
          Inspector of Mines, pursuant to 1.7.1(4) & 1.7.2 of the Code. After initial submission you
          are required to come back to your report and add your final investigation document.
        </Typography.Paragraph>
        <Typography.Title level={4}>
          Upload initial and final investigtation documents
        </Typography.Title>
        <Typography.Paragraph>
          You can upload a variety of files directly to your record. This will help ministry staff
          understand the incident and allows for faster reviews.{" "}
        </Typography.Paragraph>
        <Alert
          type="warning"
          message={<b>Did this incident result in the loss of life?</b>}
          description={
            <>
              <Typography.Paragraph>
                Immediately (within 4 hours) phone Mine Incident Reporting Line at{" "}
                <a href="tel:1-888-348-0299">1-888-348-0299</a> to submit an oral report and secure
                the accident scene.
              </Typography.Paragraph>
            </>
          }
          showIcon
        />
        <br />
      </Col>
    </Row>
  );
};

export default IncidentsGetStarted;
