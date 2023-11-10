import React, { useState, useEffect } from "react";
import { fetchMetabaseDashboard } from "@mds/common/redux/actionCreators/reportingActionCreator";

import { Row, Col, Typography } from "antd";

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
      <Row gutter={16} style={{ minHeight: "350px" }}>
        {infographUrls.map((url, index) => (
          <Col key={`home-infograph-${index}`} xs={24} md={12} lg={8}>
            <div>
              <iframe
                src={url}
                key={url}
                style={{ width: "100%", minWidth: "100%", minHeight: "320px" }}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomeInfographs;
