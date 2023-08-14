import React from "react";
import { Input, Dropdown, Card, Typography } from "antd";

import SearchBarNew from "@/components/search/SearchBarNew";
import { BACKGROUND } from "@/constants/assets";

const HomeBanner = () => {
  return (
    <div style={{ backgroundImage: `url(${BACKGROUND})`, padding: "64px 32px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography.Title style={{ color: "white" }}>Welcome back to CORE</Typography.Title>
        <SearchBarNew />
      </div>
    </div>
  );
};

export default HomeBanner;
