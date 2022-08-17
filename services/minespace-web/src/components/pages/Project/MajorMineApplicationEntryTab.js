import React from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography, Button, Empty, Steps } from "antd";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mma: CustomPropTypes.majorMinesApplication.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export const MajorMineApplicationEntryTab = (props) => {
  const mmaExists = Boolean(props.mma?.major_mine_application_guid);
  const projectGuid = props.mma?.project_guid || props.match.params?.projectGuid;
  const mmaGuid = props.mma?.major_mine_application_guid;

  const renderContent = () => {
    const buttonContent = {
      label: mmaExists ? "Resume" : "Start",
      link: mmaExists
        ? () =>
            props.history.push({
              pathname: `${routes.REVIEW_MAJOR_MINE_APPLICATION.dynamicRoute(
                projectGuid,
                mmaGuid
              )}`,
              state: { current: 2 },
            })
        : () =>
            props.history.push(`${routes.ADD_MAJOR_MINE_APPLICATION.dynamicRoute(projectGuid)}`),
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
              <Steps size="small" current={2}>
                <Steps.Step title="Get Started" />
                <Steps.Step title="Create Submission" />
                <Steps.Step title="Review & Submit" />
              </Steps>
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

MajorMineApplicationEntryTab.propTypes = propTypes;

export default withRouter(MajorMineApplicationEntryTab);
