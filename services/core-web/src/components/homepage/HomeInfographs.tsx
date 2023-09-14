import React, { useState, useEffect } from "react";
import { fetchMetabaseDashboard } from "@common/actionCreators/reportingActionCreator";

import { Row, Col, Typography } from "antd";
import ReactIframeResizer from "react-iframe-resizer-super";

const HomeInfographs = () => {
  const graphIds = ["2846", "2140", "2845"];
  const [infographUrls, setInfographUrls] = useState([]);

  useEffect(() => {
    (async () => {
      const newGraphUrls = await Promise.all(
        graphIds.map((id) => fetchMetabaseDashboard(id, "question"))
      );
      setInfographUrls(newGraphUrls);
    })();
  }, []);

  const iframeResizerOptions = { checkOrigin: false };
  const xs = 22;
  const sm = 20;
  const md = 10;
  const lg = 8;
  const xl = 6;

  return (
    <div>
      <Typography.Title level={4}>Key Insights</Typography.Title>
      <Typography.Paragraph>
        Need a specific data query from CORE or more information about our data? Contact our data
        team at <a href="mailto:EMLIAnalytics@gov.bc.ca">EMLIAnalytics@gov.bc.ca</a> or{" "}
        <a href="https://submit.digital.gov.bc.ca/app/?f=69b63f7b-c496-4a8b-8cd4-230a7025dbef&r=%2Fapp%2Fform%2Fsubmit">
          submit a request online
        </a>
        .
      </Typography.Paragraph>
      <Row justify={"space-between"}>
        {infographUrls.map((url, index) => (
          <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl} key={`home-infograph-${index}`}>
            <ReactIframeResizer src={url} key={url} iframeResizerOptions={iframeResizerOptions} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomeInfographs;
