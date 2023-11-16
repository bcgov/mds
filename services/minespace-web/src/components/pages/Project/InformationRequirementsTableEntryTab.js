import React from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Typography, Steps, Button, Empty } from "antd";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  irt: CustomPropTypes.informationRequirementsTable.isRequired,
  mrcReviewRequired: PropTypes.bool.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export const InformationRequirementsTableEntryTab = (props) => {
  const irtExists = Boolean(props?.irt?.irt_guid);
  const projectGuid = props?.irt?.project_guid || props.match.params?.projectGuid;
  const irtGuid = props?.irt?.irt_guid;
  const irtHasChangesRequested = props?.irt?.status_code === "CHR";

  const renderContent = () => {
    const buttonContent = {
      label: irtExists ? "Resume" : "Start",
      link: irtExists
        ? () =>
          props.history.push({
            pathname: `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
              projectGuid,
              irtGuid
            )}`,
            state: { current: 2 },
          })
        : () =>
          props.history.push(
            `${routes.ADD_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(projectGuid)}`
          ),
    };
    let content = null;

    if (irtHasChangesRequested) {
      buttonContent.link = () =>
        props.history.push({
          pathname: `${routes.ADD_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(projectGuid)}`,
          state: { current: 1 },
        });
    }

    const entryGraphic = !irtHasChangesRequested ? (
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

    if (!irtExists) {
      content = (
        <div style={{ textAlign: "center" }}>
          <br />
          {entryGraphic}
          <br />
          <Typography.Paragraph>
            <Typography.Title level={5}>Start new IRT submission</Typography.Title>
            Based on your project description, an Information Requirements Table is{" "}
            {props?.mrcReviewRequired ? <b>required</b> : <b>optional</b>}.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Start the final IRT submission process by clicking the button below.
          </Typography.Paragraph>
          <div>
            <Button type="primary" onClick={buttonContent.link}>
              {buttonContent.label}
            </Button>
          </div>
        </div>
      );
    } else if (irtExists && irtHasChangesRequested) {
      content = (
        <div style={{ textAlign: "center" }}>
          <br />
          {entryGraphic}
          <br />
          <Typography.Paragraph>
            <Typography.Title level={5}>
              Further information is required on your IRT submission
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
          {entryGraphic}
          <br />
          <Typography.Paragraph>
            <Typography.Title level={5}>Resume IRT submission</Typography.Title>
            <div style={{ width: "60%", margin: "0 auto" }}>
              <Steps size="small" current={2}>
                <Steps.Step title="Download Template" />
                <Steps.Step title="Import File" />
                <Steps.Step title="Review & Submit" />
              </Steps>
            </div>
            <br />
            Based on your project description, an Information Requirements Table is{" "}
            {props?.mrcReviewRequired ? <b>required</b> : <b>optional</b>}.
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
        <Typography.Title level={4}>Information Requirements Table</Typography.Title>
      </Col>
      <Col span={24}>{renderContent()}</Col>
    </Row>
  );
};

InformationRequirementsTableEntryTab.propTypes = propTypes;

export default withRouter(InformationRequirementsTableEntryTab);
