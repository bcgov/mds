import React, { useEffect, useState } from "react";
import { Button, Col, Row, Steps, Typography } from "antd";
import { Link, useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "redux-form";
import { IMine, IMineReportSubmission } from "@mds/common/interfaces";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import ReportGetStarted from "@mds/common/components/reports/ReportGetStarted";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import { createReportSubmission } from "./reportSubmissionSlice";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { SystemFlagEnum } from "@mds/common/constants";
import { FORM } from "../..";

const ReportSteps = () => {
  const system = useSelector(getSystemFlag);
  const history = useHistory();
  const dispatch = useDispatch();

  const { mineGuid, reportType } = useParams<{ mineGuid: string; reportType: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [initialValues, setInitialValues] = useState<Partial<IMineReportSubmission>>({});

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
            <ReportGetStarted
              mine={mine}
              handleSubmit={(values) => {
                setInitialValues(values);
                setCurrentStep(currentStep + 1);
              }}
              formButtons={renderStepButtons({
                nextButtonTitle: "Add Report Details",
                previousButtonTitle: "Cancel",
                previousButtonFunction: () => {
                  // necessary because it's not being destroyed on unmount
                  dispatch(reset(FORM.VIEW_EDIT_REPORT));
                  history.goBack();
                },
              })}
            />
          </div>
        );
      case 1:
        return (
          <div>
            <ReportDetailsForm
              mineGuid={mineGuid}
              initialValues={initialValues}
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
                const formValues = {
                  mine_guid: mineGuid,
                  ...values,
                };
                dispatch(createReportSubmission(formValues)).then((response) => {
                  if (response.payload) {
                    const { mine_guid, mine_report_guid } = response.payload;
                    history.push(
                      GLOBAL_ROUTES?.REPORT_VIEW_EDIT.dynamicRoute(mine_guid, mine_report_guid)
                    );
                  }
                });
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
    <div className="report-steps-page">
      <Row>
        <Col span={24}>
          <Typography.Title>Report - {mine?.mine_name ?? ""}</Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Link
            to={
              system === SystemFlagEnum.core
                ? GLOBAL_ROUTES?.MINE_REPORTS.dynamicRoute(mineGuid, reportType)
                : GLOBAL_ROUTES?.MINE_DASHBOARD.dynamicRoute(mineGuid, "reports")
            }
          >
            <ArrowLeftOutlined className="padding-sm--right" />
            {`Back to: ${mine?.mine_name} reports`}
          </Link>
        </Col>
      </Row>
      <Typography.Title className="margin-large--top margin-large--bottom" level={3}>
        Submit New Report
      </Typography.Title>
      <Steps className="report-steps" current={currentStep} items={stepItems}></Steps>
      {mine && renderStepContent()}
    </div>
  );
};

export default ReportSteps;
