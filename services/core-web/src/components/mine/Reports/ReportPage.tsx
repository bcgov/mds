import React, { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { isDirty } from "redux-form";

import {
  FORM,
  IMineReport,
  MINE_REPORT_SUBMISSION_CODES,
  reportStatusSeverityForDisplay,
  transformReportData,
} from "@mds/common";
import { getMineReportById } from "@mds/common/redux/selectors/reportSelectors";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import {
  fetchMineReport,
  updateMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";

import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import Loading from "@/components/common/Loading";
import { Alert, Button, Row, Tag, Typography } from "antd";
import { ScrollSideMenuProps } from "@mds/common/components/common/ScrollSideMenu";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";

import * as routes from "@/constants/routes";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons";

const ReportPage: FC = () => {
  const dispatch = useDispatch();
  const { mineGuid, reportGuid } = useParams<{ mineGuid: string; reportGuid: string }>();
  const mineReport: IMineReport = useSelector((state) => getMineReportById(state, reportGuid));
  const mine = useSelector((state) => getMineById(state, mineGuid));

  const [isLoaded, setIsLoaded] = useState(Boolean(mineReport && mine));
  const [isEditMode, setIsEditMode] = useState(false);

  const isFormDirty = useSelector(isDirty(FORM.VIEW_EDIT_REPORT));

  useEffect(() => {
    if (!mine || mine.mine_guid !== mineGuid) {
      dispatch(fetchMineRecordById(mineGuid));
    }
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
    const isLoaded = Boolean(mine && mineReport);
    if (isMounted) {
      setIsLoaded(isLoaded);
    }
    return () => (isMounted = false);
  }, [mine, mineReport]);

  const transformedReportData = transformReportData(mineReport);

  const getToggleEditButton = () => {
    return isEditMode ? (
      <Row justify="end">
        <Button onClick={() => setIsEditMode(false)} disabled={isFormDirty} type="ghost">
          View Report
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
      { href: "report-type", title: "Report Type" },
      { href: "report-information", title: "Report Information" },
      { href: "contact-information", title: "Contact Information" },
      { href: "documentation", title: "Documentation" },
    ],
    featureUrlRoute: sideBarRoute.url.hashRoute,
    featureUrlRouteArguments: sideBarRoute.params,
  };

  const HeaderContent = (
    <div className="padding-lg">
      <Row align="middle">
        <Typography.Title level={1}>
          <Row align="middle">
            Report Name
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

  const handleUpdateStatus = () => {
    console.log("NOT IMPLEMENTED");
  };

  const handleSubmit = (values) => {
    dispatch(updateMineReport(mine.mine_guid, mineReport.mine_report_guid, values));
  };

  const PageContent = (
    <>
      <Alert
        message={
          <Row justify="space-between" align="middle">
            <span>{transformedReportData.status}</span>
            <Button type="ghost" onClick={handleUpdateStatus} style={{ margin: 0 }}>
              Update Status
            </Button>
          </Row>
        }
        description="description"
        type={reportStatusSeverityForDisplay(
          transformedReportData.mine_report_submission_status_code as MINE_REPORT_SUBMISSION_CODES
        )}
        showIcon
      />
      {getToggleEditButton()}
      <ReportDetailsForm
        mineGuid={mineGuid}
        initialValues={mineReport}
        handleSubmit={handleSubmit}
        isEditMode={isEditMode}
        formButtons={
          isEditMode ? (
            <Row justify="space-between">
              <Button type="ghost">View Report</Button>
              <Button htmlType="submit" type="primary">
                Save Changes
              </Button>
            </Row>
          ) : null
        }
      />
      {!isEditMode && getToggleEditButton()}
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
