import React, { useEffect, useState } from "react";
import { Button, Col, Row, Steps, Typography } from "antd";
import { Link, useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IMine } from "@mds/common/interfaces";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import ReportGetStarted from "@mds/common/components/reports/ReportGetStarted";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";

import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import { createMineReport } from "@mds/common/redux/actionCreators/reportActionCreator";

const ReportSteps = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { mineGuid } = useParams<{ mineGuid: string }>();
  const [currentStep, setCurrentStep] = useState(0);

  const mine: IMine = useSelector((state) => getMineById(state, mineGuid));

  useEffect(() => {
    if (!mine) {
      dispatch(fetchMineRecordById(mineGuid));
    }
  }, []);

  const renderStepButtons = ({
    nextButtonTitle,
    previousButtonTitle,
    hidePreviousButton = false,
    previousButtonFunction = () => setCurrentStep(currentStep - 1),
    nextButtonFunction = null,
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
        <Col>
          {nextButtonFunction ? (
            <Button type="primary" onClick={nextButtonFunction}>
              {nextButtonTitle ?? "Next"}
            </Button>
          ) : (
            <Button type="primary" htmlType="submit">
              {nextButtonTitle ?? "Next"}
            </Button>
          )}
        </Col>
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
              nextButtonFunction: () => setCurrentStep(currentStep + 1),
            })}
          </div>
        );
      case 1:
        return (
          <div>
            <ReportDetailsForm
              mineGuid={mineGuid}
              handleSubmit={() => setCurrentStep(currentStep + 1)}
              formButtons={renderStepButtons({
                nextButtonTitle: "Review & Submit",
                previousButtonTitle: "Back",
              })}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <ReportDetailsForm
              isEditMode={false}
              mineGuid={mineGuid}
              handleSubmit={(values) => {
                dispatch(createMineReport(mineGuid, values));
              }}
              formButtons={renderStepButtons({
                nextButtonTitle: "Submit",
                previousButtonTitle: "Back",
              })}
            />
          </div>
        );
      default:
        return <div>4</div>;
    }
  };

  const stepItems = [
    { title: "Get Started" },
    { title: "Add Report" },
    { title: "Review & Submit" },
  ];

  return (
    <div>
      <Row>
        <Col span={24}>
          <Typography.Title>Report - {mine?.mine_name ?? ""}</Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Link to={GLOBAL_ROUTES?.MINE_DASHBOARD.dynamicRoute(mineGuid, "reports")}>
            <ArrowLeftOutlined className="padding-sm--right" />
            {`Back to: ${mine?.mine_name} reports`}
          </Link>
        </Col>
      </Row>
      <Typography.Title className="margin-large--top margin-large--bottom" level={3}>
        Submit New Report
      </Typography.Title>
      <Steps className="report-steps" current={currentStep} items={stepItems}></Steps>
      {renderStepContent()}
    </div>
  );
};

export default ReportSteps;
