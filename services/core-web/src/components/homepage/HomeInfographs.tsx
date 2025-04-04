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
        Need a specific data query from CORE or more information about our data? Contact our data service
        team via the <a href="https://bcgov.sharepoint.com/sites/EMLI-MINESGIS/Lists/MappingData%20Requests%202_0/NewForm.aspx?Source=https%3a%2f%2fbcgov.sharepoint.com%2fsites%2fEMLI-MINESGIS%2fLists%2fMappingData%2520Requests%25202_0%2fByStatus.aspx&ContentTypeId=0x0103000CEC0CF87E561A48B21F26B3DEFBD37D&RootFolder=%2fsites%2fEMLI-MINESGIS%2fLists%2fMappingData+Requests+2_0&xsdata=MDV8MDJ8TURTQGdvdi5iYy5jYXw2ZmE1ZDM1YjJlZGE0NjBiY2M5MzA4ZGNiMGI2MTMyOHw2ZmRiNTIwMDNkMGQ0YThhYjAzNmQzNjg1ZTM1OWFkY3wwfDB8NjM4NTc5NTQzMjQ4MjY1MTg1fFVua25vd258VFdGcGJHWnNiM2Q4ZXlKV0lqb2lNQzR3TGpBd01EQWlMQ0pRSWpvaVYybHVNeklpTENKQlRpSTZJazFoYVd3aUxDSlhWQ0k2TW4wPXwwfHx8&sdata=M2x3Q1BoT2I3MGdFRG9MV2lRSXU1cG1wMWN4K2x2VllKcFNzM0JOK0d4ST0%3d">
        Data and Mapping request portal
        </a> or email <a href="mailto:EMLIAnalytics@gov.bc.ca">EMLIAnalytics@gov.bc.ca</a> 
        
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
