import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Typography } from "antd";
import { formatDate } from "@mds/common/redux/utils/helpers";
import { EMPTY_FIELD, NOT_STARTED } from "@mds/common/constants/strings";

import { getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import NoticeOfWorkStagesTable from "./NoticeOfWorkStagesTable";

export const NoticeOfWorkOverviewTab: FC = () => {
  const noticeOfWorkProgress = useSelector(getNOWProgress) ?? {};
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
