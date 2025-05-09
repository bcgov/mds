import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import { Col, Row, Tabs, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import {
  fetchProponentNoticeOfWorkApplication,
  fetchApplicationDelay,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { useAppDispatch } from "@mds/common/redux/rootState";
import NoticeOfWorkOverviewTab from "./NoticeOfWorkOverviewTab";

const tabs = ["overview"];

const NoticeOfWorkPage: FC = () => {
  const { tab, nowApplicationGuid } = useParams<{
    tab: string;
    activeTab: string;
    nowApplicationGuid: string;
  }>();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(tab ?? tabs[0]);
  const dispatch = useAppDispatch();
  const noticeOfWork = useSelector(getNoticeOfWork) ?? {};
  const [isLoaded, setIsLoaded] = useState(!!noticeOfWork);
  const { mine_guid } = noticeOfWork;
  const mine = useSelector(getMineById(mine_guid));
  const { mine_name } = mine ?? {};

  const handleFetchData = async () => {
    await Promise.all([
      dispatch(fetchProponentNoticeOfWorkApplication(nowApplicationGuid)),
      dispatch(fetchApplicationDelay(nowApplicationGuid)),
    ]).then(() => setIsLoaded(true));
  };

  const handleTabChange = (newActiveTab) => {
    setActiveTab(newActiveTab);
    let url = router.VIEW_NOTICE_OF_WORK.dynamicRoute(nowApplicationGuid, newActiveTab);
    return history.push(url);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const pageClass = "padding-lg--top";
  const tabItems = [
    {
      label: "Overview",
      key: "overview",
      children: (
        <div className={pageClass}>
          <NoticeOfWorkOverviewTab />
        </div>
      ),
    },
  ];

  return isLoaded ? (
    <div className="fixed-tabs-container">
      <div className="view--header padding-lg--sides">
        <Row>
          <Col span={24}>
            <Typography.Title>{noticeOfWork.now_number}</Typography.Title>
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Link
              to={router.MINE_DASHBOARD.dynamicRoute(mine_guid, "applications", "notice-of-work")}
            >
              <ArrowLeftOutlined className="padding-sm-right" />
              Back to: {mine_name} Applications page
            </Link>
          </Col>
        </Row>
      </div>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Tabs
            defaultActiveKey={activeTab}
            onChange={handleTabChange}
            className="core-tabs fixed-tabs-tabs"
            items={tabItems}
            destroyInactiveTabPane={true}
          />
        </Col>
      </Row>
    </div>
  ) : (
    <Loading />
  );
};
export default NoticeOfWorkPage;
