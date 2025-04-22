import { FC, useContext, useState } from "react";
import Projects from "./Projects";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Tabs, Typography } from "antd";
import NoticeOfWorkProjects from "./NoticeOfWorkProjects";
import { IMine } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { MINE_DASHBOARD } from "@/constants/routes";

const tabs = ["major-mine-application", "notice-of-work"];

const ViewProjects: FC = () => {
  const {
    mine,
    activeTab: dashboardTab,
    subTab,
  } = useContext<{ mine: IMine; activeTab: string; subTab: string }>(SidebarContext);
  const isMajorMine = mine?.major_mine_ind;
  const [activeTab, setActiveTab] = useState(subTab ?? tabs[0]);
  const history = useHistory();

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
    return history.push(MINE_DASHBOARD.dynamicRoute(mine?.mine_guid, dashboardTab, newActiveTab));
  };

  return (
    <div className="fixed-tabs-container">
      <Typography.Title level={1}>Applications</Typography.Title>
      <Tabs type="card" items={tabItems} defaultActiveKey={activeTab} onChange={handleTabChange} />
    </div>
  );
};

export default ViewProjects;
