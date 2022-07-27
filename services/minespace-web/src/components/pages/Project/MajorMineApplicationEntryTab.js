import React from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography, Button, Empty } from "antd";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";

const propTypes = {
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
  const projectGuid = props.match.params?.projectGuid;

  const renderContent = () => {
    const buttonContent = {
      label: "Start",
      link: () =>
        props.history.push(`${routes.ADD_MAJOR_MINE_APPLICATION.dynamicRoute(projectGuid)}`),
    };

    const entryGraphic = (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{ transform: "scale(2.0)" }}
        description={false}
      />
    );

    return (
      <div style={{ textAlign: "center" }}>
        <br />
        {entryGraphic}
        <br />
        <Typography.Paragraph>
          <Typography.Title level={5}>Start new Major Mine Application</Typography.Title>
          Based on your project description, a Major Mine Application is required.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Start the final submission process by clicking the button below.
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
