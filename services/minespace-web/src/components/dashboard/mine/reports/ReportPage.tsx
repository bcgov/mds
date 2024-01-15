import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getFormSubmitErrors, getFormValues, submit } from "redux-form";

import { Button, Col, Row, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";

import { FORM } from "@mds/common/constants/forms";
import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import { fetchMineReport } from "@mds/common/redux/actionCreators/reportActionCreator";
import { getMineReportById } from "@mds/common/redux/reducers/reportReducer";
import Loading from "@/components/common/Loading";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { IMineReport, MINE_REPORT_STATUS_HASH, MINE_REPORT_SUBMISSION_CODES } from "@mds/common";
import Callout from "@mds/common/components/common/Callout";
import { reportStatusSeverity } from "./ReportsTable";

const ReportPage = () => {
  const dispatch = useDispatch();
  const { mineGuid, reportGuid } = useParams<{ mineGuid: string; reportGuid: string }>();
  const mineReport = useSelector((state) => getMineReportById(state, reportGuid));
  const mine = useSelector((state) => getMineById(state, mineGuid));
  const [loaded, setIsLoaded] = useState(mineReport && mine);
  const [isEditMode, setIsEditMode] = useState(false);

  // get form data so we can submit it outside of the form
  const formErrors = useSelector(getFormSubmitErrors(FORM.VIEW_EDIT_REPORT));
  const formValues = useSelector(getFormValues(FORM.VIEW_EDIT_REPORT));

  useEffect(() => {
    if (!mine || mine.mine_guid !== mineGuid) {
      dispatch(fetchMineRecordById(mineGuid));
    }
  }, [mineGuid]);

  useEffect(() => {
    if (
      !mineReport ||
      mineReport.mine_report_guid !== reportGuid ||
      mineReport.mine_guid !== mineGuid
    ) {
      dispatch(fetchMineReport(mineGuid, reportGuid));
    }
  }, [reportGuid, mineGuid]);

  useEffect(() => {
    let isMounted = true;
    const isLoaded = mine && mineReport;
    if (isMounted) {
      setIsLoaded(isLoaded);
    }
    return () => (isMounted = false);
  }, [mine, mineReport]);

  const transformData = (report: IMineReport) => {
    const submissionCount = report?.mine_report_submissions?.length ?? 0;
    if (submissionCount > 0) {
      const latestSubmission = report.mine_report_submissions[submissionCount - 1];

      const { mine_report_submission_status_code, submission_date } = latestSubmission;
      return {
        ...report,
        mine_report_submission_status_code,
        status: MINE_REPORT_STATUS_HASH[mine_report_submission_status_code],
        submission_date,
      };
    }
    return {
      ...report,
      status: "",
      mine_report_submission_status_code: "",
      submission_date: "",
      submitter_name: "",
    };
  };

  const handleUpdateReport = (values) => {
    console.log("HANDLE UPDATE REPORT");
    console.log(values);
  };

  const handleOtherSubmitButton = () => {
    dispatch(submit(FORM.VIEW_EDIT_REPORT));
    if (!formErrors) {
      handleUpdateReport(formValues);
    }
  };

  const transformedReportData = transformData(mineReport);
  console.log(transformedReportData);
  return (
    (loaded && (
      <div>
        <Row>
          <Col span={24}>
            <Typography.Title>Report - {mine.mine_name}</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={GLOBAL_ROUTES?.MINE_DASHBOARD.dynamicRoute(mineGuid, "reports")}>
              <ArrowLeftOutlined className="padding-sm--right" />
              {`Back to: Reports page`}
            </Link>
          </Col>
        </Row>
        <Row align="middle" justify="space-between">
          <Typography.Title level={2}>{mineReport.report_name}</Typography.Title>
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} type="primary">
              Edit Report
            </Button>
          ) : (
            <Button type="primary" onClick={handleOtherSubmitButton}>
              Save Changes
            </Button>
          )}
        </Row>

        {!isEditMode && transformedReportData?.status && (
          <Callout
            title={`Submission ${transformedReportData.status}`}
            message={
              <>
                <p>Your report has been {transformedReportData.status}.</p>
                <p>
                  {transformedReportData.submission_date} by {transformedReportData.submitter_name}
                </p>
              </>
            }
            severity={reportStatusSeverity(
              transformedReportData.mine_report_submission_status_code as MINE_REPORT_SUBMISSION_CODES
            )}
          />
        )}
        <ReportDetailsForm
          mineGuid={mineGuid}
          initialValues={mineReport}
          handleSubmit={handleUpdateReport}
          isEditMode={isEditMode}
          formButtons={
            isEditMode ? (
              <Button htmlType="submit" type="primary">
                Save Changes
              </Button>
            ) : null
          }
        />
      </div>
    )) || <Loading />
  );
};

export default ReportPage;
