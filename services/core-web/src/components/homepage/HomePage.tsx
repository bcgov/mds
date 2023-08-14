import React, { useState } from "react";

import HomeBanner from "./HomeBanner";
import HomeTopLinks from "./HomeTopLinks";
import HomeInfographs from "./HomeInfographs";
import HomeMineActivity from "./HomeMineActivity";
import HomeSidePanel from "./HomeSidePanel";

import { Skeleton, Layout } from "antd";

const HomePageNew = () => {
  const [loading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, 3000);

  const { Header, Sider, Content } = Layout;

  return (
    <Skeleton loading={loading}>
      <Layout>
        <HomeBanner />
        <Layout>
          <Content>
            <HomeTopLinks />
            <HomeInfographs />
            <HomeMineActivity />
          </Content>
          <Sider theme={"light"}>
            <HomeSidePanel />
          </Sider>
        </Layout>
      </Layout>
    </Skeleton>
  );
};

export default HomePageNew;
