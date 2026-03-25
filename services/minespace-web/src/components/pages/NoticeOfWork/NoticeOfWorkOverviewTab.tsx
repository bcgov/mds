import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Typography, Alert, Button } from "antd";
import { formatDate } from "@mds/common/redux/utils/helpers";
import { EMPTY_FIELD, NOT_STARTED } from "@mds/common/constants/strings";

import { getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import NoticeOfWorkStagesTable from "./NoticeOfWorkStagesTable";
import { INoticeOfWork } from "@mds/common/interfaces";
import { NOW_APPLICATION_TIER_EXPLAINATION_LINK } from "@/constants/strings";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";

interface NoticeOfWorkOverviewTabProps {
  noticeOfWork: INoticeOfWork;
}

export const NoticeOfWorkOverviewTab: FC<NoticeOfWorkOverviewTabProps> = ({ noticeOfWork }) => {
  const noticeOfWorkProgress = useSelector(getNOWProgress) ?? {};
  const { isFeatureEnabled } = useFeatureFlag();
  const isTypeMineralOrCoal = ["Mineral", "Coal"].includes(
    noticeOfWork?.notice_of_work_type_description
  );

  const nowApplicationStages = [
    {
      title: "Technical Review",
      stageCode: "REV",
    },
    {
      title: "Referral to Other Agencies",
      stageCode: "REF",
    },
    {
      title: "First Nations Consultation",
      stageCode: "CON",
    },
    {
      title: "Open for Public Comment",
      stageCode: "PUB",
    },
    {
      title: "Permit Considerations in Review",
      stageCode: "DFT",
    },
  ];

  const buildApplicationStages = (nowApplicationStages) => {
    const stages = nowApplicationStages.map((stage) => {
      const stageCode = stage.stageCode;
      const status = noticeOfWorkProgress[stageCode]
        ? noticeOfWorkProgress[stageCode].status
        : NOT_STARTED;
      const inStatusSince = noticeOfWorkProgress[stageCode]
        ? `${formatDate(noticeOfWorkProgress[stageCode].start_date)}`
        : EMPTY_FIELD;
      return {
        ...stage,
        status: status,
        inStatusSince: inStatusSince,
      };
    });
    return stages;
  };

  return (
    <Row gutter={[0, 16]}>
      <Col lg={{ span: 14 }} xl={{ span: 16 }}>
        {isFeatureEnabled(Feature.NOTICE_OF_WORK_TIER) &&
        isTypeMineralOrCoal &&
        noticeOfWork?.now_application_tier_code ? (
          <Alert
            message=""
            description={
              <Row justify="space-between" align="middle">
                <Col xs={24} md={18}>
                  <p>
                    <b>Assigned Tier: {noticeOfWork?.now_application_tier_code}</b>
                    <br />
                    This tier sets the target service timeline for review.
                    <br />
                    Assigned on: {noticeOfWork?.now_application_tier_created_date}
                    <br />
                    Last Updated on: {noticeOfWork?.now_application_tier_updated_date}
                  </p>
                </Col>
                <Col xs={24} md={6} style={{ textAlign: "right" }}>
                  <a
                    href={NOW_APPLICATION_TIER_EXPLAINATION_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>View tier details</Button>
                  </a>
                </Col>
              </Row>
            }
            type="info"
            style={{
              backgroundColor: "#FFC943",
              border: "1.5px solid #E8A302",
              marginBottom: "20px",
            }}
            className="ant-alert-info ant-alert-info-custom-with-black-icon"
          />
        ) : null}
        <Typography.Title level={4}>Application Stages</Typography.Title>
        <Typography.Paragraph>
          Applications shown here were submitted through FrontCounter BC and cannot be edited in
          MineSpace. For assistance please contact your regional office.
        </Typography.Paragraph>
        <NoticeOfWorkStagesTable
          nowApplicationStages={buildApplicationStages(nowApplicationStages)}
        />
      </Col>
    </Row>
  );
};

export default NoticeOfWorkOverviewTab;
