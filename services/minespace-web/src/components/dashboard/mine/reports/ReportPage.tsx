import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getFormSubmitErrors, getFormValues, isDirty, submit } from "redux-form";

import { Button, Col, Row, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";

import { FORM } from "@mds/common/constants/forms";
import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import Loading from "@/components/common/Loading";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import {
  IMine,
  IMineReportSubmission,
  MINE_REPORT_STATUS_HASH,
  MINE_REPORT_SUBMISSION_CODES,
} from "@mds/common";
import Callout from "@mds/common/components/common/Callout";
import { reportStatusSeverity } from "./ReportsTable";
import {
  createReportSubmission,
  fetchLatestReportSubmission,
  getLatestReportSubmission,
} from "@mds/common/components/reports/reportSubmissionSlice";

const ReportPage = () => {
  const dispatch = useDispatch();
  const { mineGuid, reportGuid } = useParams<{ mineGuid: string; reportGuid: string }>();
  const latestSubmission: IMineReportSubmission = useSelector((state) =>
    getLatestReportSubmission(state, reportGuid)
  );
  const mine: IMine = useSelector((state) => getMineById(state, mineGuid));
  const [loaded, setLoaded] = useState(Boolean(latestSubmission && mine));
  const [isEditMode, setIsEditMode] = useState(false);

  // get form data so we can submit it outside of the form
  const formErrors = useSelector(getFormSubmitErrors(FORM.VIEW_EDIT_REPORT));
  const formValues = useSelector(getFormValues(FORM.VIEW_EDIT_REPORT));
  const isFormDirty = useSelector(isDirty(FORM.VIEW_EDIT_REPORT));

  useEffect(() => {
    let isMounted = true;
    const isLoaded = Boolean(mine && latestSubmission);
    if (isMounted) {
      setLoaded(isLoaded);
    }
    return () => (isMounted = false);
  }, [mine, latestSubmission]);

  useEffect(() => {
    if (!mine || mine.mine_guid !== mineGuid) {
      dispatch(fetchMineRecordById(mineGuid));
    }

    if (!latestSubmission || latestSubmission.mine_report_guid !== reportGuid) {
      dispatch(fetchLatestReportSubmission({ mine_report_guid: reportGuid }));
    }
  }, [reportGuid, mineGuid]);

  const handleUpdateReport = (values) => {
    dispatch(createReportSubmission({ ...values, mine_guid: mineGuid })).then((response) => {
      if (response.payload) {
        setIsEditMode(false);
      }
    });
  };

  const handleOtherSubmitButton = () => {
    dispatch(submit(FORM.VIEW_EDIT_REPORT));
    if (!formErrors) {
      handleUpdateReport(formValues);
    }
  };

  const status = MINE_REPORT_STATUS_HASH[latestSubmission?.mine_report_submission_status_code];

  const MINE_REPORT_STATUS_DESCRIPTION_HASH = {
    [MINE_REPORT_SUBMISSION_CODES.NON]:
      "This ministry has requested the report below. Please finish and submit this submission.",
    [MINE_REPORT_SUBMISSION_CODES.ACC]:
      "This report has been submitted and has been reviewed by ministry staff.",
    [MINE_REPORT_SUBMISSION_CODES.REC]:
      "Your changes to this report have been submitted successfully.",
    [MINE_REPORT_SUBMISSION_CODES.REQ]:
      "This report requires changes, refer to the email from the ministry or contact your regional Mines Compliance Inspector for more details.",
    [MINE_REPORT_SUBMISSION_CODES.INI]: "This report has been submitted successfully.",
    [MINE_REPORT_SUBMISSION_CODES.WTD]:
      "This report has been withdrawn. If you have any questions, please contact the permitting inspector or your regional office.",
    [MINE_REPORT_SUBMISSION_CODES.NRQ]: "This report is not requested",
  };

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
          <Typography.Title level={2}>{latestSubmission.report_name}</Typography.Title>
          {isEditMode && (
            <Button type="primary" disabled={!isFormDirty} onClick={handleOtherSubmitButton}>
              Save Changes
            </Button>
          )}
          {!isEditMode &&
            latestSubmission.mine_report_submission_status_code ==
              MINE_REPORT_SUBMISSION_CODES.NON && (
              <Button onClick={() => setIsEditMode(true)} type="primary">
                Submit Report
              </Button>
            )}
        </Row>

        {!isEditMode && status && (
          <Callout
            title={status}
            message={
              MINE_REPORT_STATUS_DESCRIPTION_HASH[
                latestSubmission?.mine_report_submission_status_code
              ]
            }
            severity={reportStatusSeverity(
              latestSubmission.mine_report_submission_status_code as MINE_REPORT_SUBMISSION_CODES
            )}
          />
        )}
        <ReportDetailsForm
          mineGuid={mineGuid}
          initialValues={latestSubmission}
          handleSubmit={handleUpdateReport}
          isEditMode={isEditMode}
          formButtons={
            isEditMode ? (
              <Button htmlType="submit" disabled={!isFormDirty} type="primary">
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
