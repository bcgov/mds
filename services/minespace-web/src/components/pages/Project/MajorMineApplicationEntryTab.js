import React from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography, Button, Empty, Steps } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES } from "./MajorMineApplicationPage";

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
  const mmaStatus = props.mma?.status_code;
  const mmaHasChangesRequested = mmaStatus === "CHR";

  const renderContent = () => {
    let url = routes.ADD_MAJOR_MINE_APPLICATION.dynamicRoute(projectGuid);
    let urlState = {};
    if (mmaExists && ["DFT", "CHR"].includes(mmaStatus)) {
      urlState = { state: { current: 1 } };
    } else if (mmaExists && MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES.includes(mmaStatus)) {
      url = routes.REVIEW_MAJOR_MINE_APPLICATION.dynamicRoute(projectGuid, mmaGuid);
      urlState = { state: { current: 2 } };
    }

    const buttonContent = {
      label: mmaExists ? "Resume" : "Start",
      link: () => props.history.push({ pathname: url, ...urlState }),
    };
    let content = null;

    const entryGraphic = !mmaHasChangesRequested ? (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{ transform: "scale(2.0)" }}
        description={false}
      />
    ) : (
      <ExclamationCircleOutlined
        style={{
          color: "#D40D0D",
          marginTop: "3.0em",
          marginBottom: "4.5em",
          transform: "scale(6.0)",
        }}
      />
    );

    if (!mmaExists) {
      content = (
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
    } else if (mmaExists && mmaHasChangesRequested) {
      content = (
        <div style={{ textAlign: "center" }}>
          <br />
          {entryGraphic}
          <br />
          <Typography.Paragraph>
            <Typography.Title level={5}>
              Further information is required on your Major Mine Application submission
            </Typography.Title>
            Your submission has been reviewed and some changes are required for completing the
            review process.
          </Typography.Paragraph>
          <Typography.Paragraph>Please check your inbox for more information.</Typography.Paragraph>
          <div>
            <Button type="primary" onClick={buttonContent.link}>
              {buttonContent.label}
            </Button>
          </div>
        </div>
      );
    } else {
      content = (
        <div style={{ textAlign: "center" }}>
          <br />
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
    return content;
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
