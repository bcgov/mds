import { FC, useContext, useState } from "react";
import Projects from "./Projects";
import React from "react";
import { useParams } from "react-router-dom";
import { Tabs, Typography } from "antd";
import NoticeOfWorkProjects from "./NoticeOfWorkProjects";
import { IMine } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";

const tabs = ["Major Mine Applications", "Notice of Work Applications"];

const ViewProjects: FC = () => {
  const { id, tab } = useParams<{
    id: string;
    tab: string;
  }>();

  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const isMajorMine = mine?.major_mine_ind;
  const [activeTab, setActiveTab] = useState(tab ?? tabs[0]);

  const { isFeatureEnabled } = useFeatureFlag();
  const showNOWStatus = isFeatureEnabled(Feature.MINESPACE_NOW_STATUS);

  const tabItems = [
    isMajorMine && {
      key: tabs[0],
      label: "Major Mine Applications",
      children: <Projects />,
    },
    showNOWStatus && {
      key: tabs[1],
      label: "Notice of Work Applications",
      children: <NoticeOfWorkProjects />,
    },
  ].filter(Boolean);

  const handleTabChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
  };

  return (
    <div className="fixed-tabs-container">
      <Typography.Title level={1}>Applications</Typography.Title>
      <Tabs type="card" items={tabItems} defaultActiveKey={activeTab} onChange={handleTabChange} />
    </div>
  );
};

export default ViewProjects;
