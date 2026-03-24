import React from "react";
import { Typography, Col, Row } from "antd";

import GlobalSearch from "@/components/search/GlobalSearch/GlobalSearch";
import SearchBar from "@/components/search/SearchBar";
import { BACKGROUND } from "@/constants/assets";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";

const HomeBanner = () => {
  const { isFeatureEnabled } = useFeatureFlag();
  return (
    <div
      style={
        {
          "--img": `url(${BACKGROUND})`,
          position: "relative",
        } as React.CSSProperties
      }
      id="homepage-banner"
    >
      <Row justify="center">
        <Col>
          <Typography.Title
            level={1}
            style={{ color: "white", fontSize: "28px", textAlign: "center" }}
          >
            Welcome back to CORE
          </Typography.Title>
          <Row align="middle" justify="center" id="home-banner-search-container">
            {isFeatureEnabled(Feature.GLOBAL_SEARCH_V2) ? (
              <Col span={18}>
                <GlobalSearch
                  placeholder="Search by Mines, Contacts, Permits or Documents Name..."
                  size="large"
                  enableShortcut={false}
                />
              </Col>
            ) : (
              <Col span={18}>
                <SearchBar
                  iconPlacement="suffix"
                  placeholderText="Search by Mines, Contacts, Permits or Documents Name..."
                  size="large"
                  showFocusButton={false}
                />
              </Col>
            )}
          </Row>
        </Col>

        <Typography.Paragraph
          type="secondary"
          style={{
            position: "absolute",
            right: "10px",
            bottom: "10px",
            margin: "0",
            fontSize: "14px",
            color: "#fff",
            opacity: 0.8,
          }}
        >
          Photo Credit: Dominic Yague
        </Typography.Paragraph>
      </Row>
    </div>
  );
};

export default HomeBanner;
