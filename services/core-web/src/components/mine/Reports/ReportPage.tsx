import React, { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { change, isDirty, reset } from "redux-form";
import { Alert, Button, Modal, Row, Select, Tag, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons";

import * as routes from "@/constants/routes";
import {
  FORM,
  IMineReportSubmission,
  MINE_REPORT_STATUS_HASH,
  MINE_REPORT_SUBMISSION_CODES,
  reportStatusSeverityForDisplay,
} from "@mds/common";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getDropdownMineReportStatusOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchLatestReportSubmission,
  getLatestReportSubmission,
  createReportSubmission,
} from "@mds/common/components/reports/reportSubmissionSlice";

import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import Loading from "@/components/common/Loading";
import { ScrollSideMenuProps } from "@mds/common/components/common/ScrollSideMenu";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";

const ReportPage: FC = () => {
  const dispatch = useDispatch();
  const { mineGuid, reportGuid } = useParams<{ mineGuid: string; reportGuid: string }>();
  const mine = useSelector((state) => getMineById(state, mineGuid));
  const mineReportStatusOptions = useSelector(getDropdownMineReportStatusOptions);
  const latestSubmission = useSelector((state) => getLatestReportSubmission(state, reportGuid));

  const [selectedStatus, setSelectedStatus] = useState<MINE_REPORT_SUBMISSION_CODES>(
    latestSubmission?.mine_report_submission_status_code
  );
  const [isLoaded, setIsLoaded] = useState(Boolean(latestSubmission && mine));
  const [isEditMode, setIsEditMode] = useState(false);

  const isFormDirty = useSelector(isDirty(FORM.VIEW_EDIT_REPORT));
  console.log("isFormDirty", isFormDirty);

  useEffect(() => {
    let isMounted = true;
    const loaded = Boolean(latestSubmission);
    if (isMounted) {
      setIsLoaded(loaded);
    }

    return () => (isMounted = false);
  }, [latestSubmission]);

  useEffect(() => {
    if (!latestSubmission || latestSubmission.mine_report_guid !== reportGuid) {
      dispatch(fetchLatestReportSubmission({ mine_report_guid: reportGuid }));
    }
    if (!mine || mine.mine_guid !== mineGuid) {
      dispatch(fetchMineRecordById(mineGuid));
    }
  }, [mineGuid, reportGuid]);

  useEffect(() => {
    setSelectedStatus(latestSubmission?.mine_report_submission_status_code);
  }, [latestSubmission?.mine_report_submission_status_code]);

  const cancelConfirmWrapper = (cancelFunction) =>
    !isFormDirty
      ? cancelFunction()
      : Modal.confirm({
          title: "Discard changes?",
          content: "All changes made will not be saved.",
          onOk: cancelFunction,
          cancelText: "Continue Editing",
          okText: "Discard",
        });

  const revertChanges = () => {
    dispatch(reset(FORM.VIEW_EDIT_REPORT));
    setIsEditMode(false);
  };

  const getFormButtons = () => {
    return isEditMode ? (
      <Row justify="space-between">
        <Button onClick={() => cancelConfirmWrapper(revertChanges)} type="ghost">
          Cancel
        </Button>
        <Button htmlType="submit" type="primary" disabled={!isFormDirty}>
          Save Changes
        </Button>
      </Row>
    ) : (
      <Row justify="end">
        <Button onClick={() => setIsEditMode(true)} type="primary">
          Edit Report
        </Button>
      </Row>
    );
  };

  const sideBarRoute = {
    url: routes.REPORT_VIEW_EDIT,
    params: [mineGuid, reportGuid],
  };
  const headerHeight = 140;

  const scrollSideMenuProps: ScrollSideMenuProps = {
    menuOptions: [
      { href: "regulatory-authority", title: "Regulatory Authority" },
      { href: "report-type", title: "Report Type" },
      { href: "report-information", title: "Report Information" },
      { href: "contact-information", title: "Report Contact Information" },
      { href: "documentation", title: "Documentation" },
      { href: "internal-ministry-comments", title: "Comments" },
    ],
    featureUrlRoute: sideBarRoute.url.hashRoute,
    featureUrlRouteArguments: sideBarRoute.params,
  };

  const HeaderContent = (
    <div className="padding-lg">
      <Row align="middle">
        <Typography.Title level={1}>
          <Row align="middle">
            {latestSubmission?.report_name}
            <Tag
              title={`Mine: ${mine?.mine_name}`}
              icon={<FontAwesomeIcon icon={faLocationDot} />}
              className="page-header-title-tag tag-primary"
            >
              <Link
                to={routes.MINE_SUMMARY.dynamicRoute(mine?.mine_guid)}
                style={{ textDecoration: "none" }}
              >
                {mine?.mine_name}
              </Link>
            </Tag>
          </Row>
        </Typography.Title>
      </Row>
      <Link to={routes.REPORTS_DASHBOARD.route}>
        <ArrowLeftOutlined />
        Back to: Reports
      </Link>
    </div>
  );

  const handleUpdateStatus = (value: MINE_REPORT_SUBMISSION_CODES) => {
    dispatch(change(FORM.VIEW_EDIT_REPORT, "mine_report_submission_status_code", value));
    setSelectedStatus(value);
  };

  const handleSubmit = (values: IMineReportSubmission) => {
    dispatch(createReportSubmission(values)).then((response) => {
      if (response.payload) {
        setIsEditMode(false);
      }
    });
  };
  const PageContent = (
    <>
      <Alert
        message={
          <Row justify="space-between" align="middle">
            <span>
              {MINE_REPORT_STATUS_HASH[latestSubmission?.mine_report_submission_status_code]}
            </span>
            <Select
              disabled={!isEditMode}
              virtual={false}
              dropdownMatchSelectWidth
              allowClear={false}
              value={selectedStatus}
              options={mineReportStatusOptions}
              onChange={handleUpdateStatus}
              style={{ minWidth: "210px" }}
            />
          </Row>
        }
        type={reportStatusSeverityForDisplay(latestSubmission?.mine_report_submission_status_code)}
        showIcon
      />
      <ReportDetailsForm
        mineGuid={mineGuid}
        initialValues={latestSubmission}
        handleSubmit={handleSubmit}
        isEditMode={isEditMode}
        formButtons={getFormButtons()}
      />
    </>
  );

  return isLoaded ? (
    <ScrollSidePageWrapper
      menuProps={scrollSideMenuProps}
      headerHeight={headerHeight}
      header={HeaderContent}
      content={PageContent}
    />
  ) : (
    <Loading />
  );
};

export default ReportPage;
