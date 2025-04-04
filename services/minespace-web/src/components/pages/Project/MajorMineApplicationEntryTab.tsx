import React, { FC } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Row, Col, Typography, Button, Empty, Steps } from "antd";
import * as routes from "@/constants/routes";
import { IMajorMinesApplication } from "@mds/common/interfaces/projects/majorMinesApplication.interface";
import { MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES } from "@mds/common/constants/enums";

interface MajorMineApplicationEntryTabProps {
  mma: IMajorMinesApplication;
}

export const MajorMineApplicationEntryTab: FC<MajorMineApplicationEntryTabProps> = ({ mma }) => {
  const mmaExists = Boolean(mma?.major_mine_application_guid);
  const { projectGuid } = useParams<{ projectGuid: string }>();
  const history = useHistory();
  const mmaGuid = mma?.major_mine_application_guid;

  // no mma? get started. generally? review
  // expected to edit? create submission
  let defaultCurrent = mmaExists ? 2 : 0;
  if (
    [
      MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES.DFT,
      MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES.CHR,
    ].includes(mma?.status_code)
  ) {
    defaultCurrent = 1;
  }

  const renderContent = () => {
    const buttonContent = {
      label: mmaExists ? "Resume" : "Start",
      link: mmaExists
        ? () =>
            history.push({
              pathname: `${routes.REVIEW_MAJOR_MINE_APPLICATION.dynamicRoute(
                projectGuid,
                mmaGuid
              )}`,
              state: { current: defaultCurrent },
            })
        : () => history.push(`${routes.ADD_MAJOR_MINE_APPLICATION.dynamicRoute(projectGuid)}`),
    };

    const entryGraphic = (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{ transform: "scale(2.0)" }}
        description={false}
      />
    );

    if (mmaExists) {
      return (
        <div style={{ textAlign: "center" }}>
          {entryGraphic}
          <br />
          <Typography.Paragraph>
            <Typography.Title level={5}>Resume Major Mine Application</Typography.Title>
            <div style={{ width: "60%", margin: "0 auto" }}>
              <Steps
                size="small"
                current={defaultCurrent}
                items={[
                  { title: "Get Started" },
                  { title: "Create Submission" },
                  { title: "Review & Submit" },
                ]}
              />
            </div>
            <br />
            The next stage in your project is the submission of a Major Mine Application.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Resume where you left off by clicking the button below.
          </Typography.Paragraph>
          <div>
            <Button type="primary" onClick={buttonContent.link}>
              {buttonContent.label}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ textAlign: "center" }}>
        <br />
        {entryGraphic}
        <br />
        <Typography.Paragraph>
          <Typography.Title level={5}>Start new Major Mine Application</Typography.Title>
          The next stage in your project is the submission of a Major Mine Application.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Start the submission process by clicking the button below.
        </Typography.Paragraph>
        <div>
          <Button type="primary" onClick={buttonContent.link}>
            {buttonContent.label}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={4}>Major Mines Application</Typography.Title>
      </Col>
      <Col span={24}>{renderContent()}</Col>
    </Row>
  );
};

export default MajorMineApplicationEntryTab;
