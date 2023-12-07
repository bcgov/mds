import React, { useEffect, useState } from "react";
import { Button, Col, Row, Steps, Typography } from "antd";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IMine } from "@mds/common/interfaces";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import { useParams, useHistory } from "react-router-dom";
import ReportGetStarted from "@mds/common/components/reports/ReportGetStarted";
import { fetchMineRecords } from "@mds/common/redux/actionCreators/mineActionCreator";

const routes = GLOBAL_ROUTES;
const ReportSteps = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { mineGuid } = useParams<{ mineGuid: string }>();
  const mines: IMine = useSelector(getMines);
  const mine = mines[mineGuid];

  useEffect(() => {
    if (!mine) {
      dispatch(fetchMineRecords);
    }
  }, [mine]);

  const [currentStep, setCurrentStep] = useState(0);

  const renderStepButtons = ({
    nextButtonTitle,
    previousButtonTitle,
    hideNextButton = false,
    hidePreviousButton = false,
    nextButtonFunction = () => setCurrentStep(currentStep + 1),
    previousButtonFunction = () => setCurrentStep(currentStep - 1),
  }) => {
    return (
      <Row justify="end" gutter={16}>
        {!hidePreviousButton && (
          <Col>
            <Button type="default" onClick={previousButtonFunction}>
              {previousButtonTitle ?? "Previous"}
            </Button>
          </Col>
        )}
        {!hideNextButton && (
          <Col>
            <Button type="primary" onClick={nextButtonFunction}>
              {nextButtonTitle ?? "Next"}
            </Button>
          </Col>
        )}
      </Row>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <ReportGetStarted />
            {renderStepButtons({
              nextButtonTitle: "Add Report Details",
              previousButtonTitle: "Cancel",
              previousButtonFunction: () => history.goBack(),
            })}
          </div>
        );
      case 1:
        return (
          <div>
            <p>this stuff</p>
            {renderStepButtons({
              nextButtonTitle: "Review & Submit",
              previousButtonTitle: "Back",
            })}
          </div>
        );
      case 2:
        return <div>3</div>;
      default:
        return <div>4</div>;
    }
  };

  return (
    <div>
      <Row>
        <Col span={24}>
          <Typography.Title>Report - {mine?.mine_name ?? ""}</Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Link to={routes.MINE_DASHBOARD.dynamicRoute(mineGuid, "reports")}>
            <ArrowLeftOutlined className="padding-sm--right" />
            {`Back to: ${mine?.mine_name} reports`}
          </Link>
        </Col>
      </Row>
      <Typography.Title className="margin-large--top margin-large--bottom" level={3}>
        Submit Report
      </Typography.Title>
      <Steps className="report-steps" current={currentStep}>
        <Steps.Step title="Get Started" />
        <Steps.Step title="Add Report" />
        <Steps.Step title="Review & Submit" />
      </Steps>
      {renderStepContent()}
    </div>
  );
};

export default ReportSteps;
