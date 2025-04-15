import React, { FC, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Typography } from "antd";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine } from "@mds/common/interfaces/mine.interface";
import NoticeOfWorkTable from "./NoticeOfWorkTable";
import { getNoticeOfWorkList } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { fetchProponentNoticeOfWorkApplications } from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { useAppDispatch } from "@mds/common/redux/rootState";

export const Projects: FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const dispatch = useAppDispatch();
  const applications = useSelector(getNoticeOfWorkList);

  useEffect(() => {
    if (!isLoaded) {
      dispatch(fetchProponentNoticeOfWorkApplications(mine.mine_guid)).then(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={1}>Notice of Work Applications</Typography.Title>
        <Typography.Paragraph>
          A{" "}
          <Typography.Text className="color-primary" strong>
            Notice of Work Application(NOW)&nbsp;
          </Typography.Text>
          is required to obtain a Mines Act permit for exploring and developing mineral, coal,
          placer, quarry, and aggregate resources in the province. This application applies to both
          new permits and amendments. For more details or to apply, visit{" "}
          <a
            href="https://portal.nrs.gov.bc.ca/web/client/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            FrontCounter BC
          </a>
          .{" "}
        </Typography.Paragraph>
        <Typography.Paragraph>
          Applications shown here were submitted through FrontCounter BC and cannot be edited in
          MineSpace. For assistance, please contact your regional office.
        </Typography.Paragraph>

        <NoticeOfWorkTable applications={applications} isLoaded={isLoaded} />
      </Col>
    </Row>
  );
};

export default Projects;
