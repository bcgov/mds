import React, { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getFormSubmitErrors, getFormValues, isDirty } from "redux-form";

import { FORM, IMineReport, MINE_REPORT_STATUS_HASH } from "@mds/common";
import { getMineReportById } from "@mds/common/redux/selectors/reportSelectors";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { fetchMineReport } from "@mds/common/redux/actionCreators/reportActionCreator";

import ReportDetailsForm from "@mds/common/components/reports/ReportDetailsForm";
import Loading from "@/components/common/Loading";
import { Button, Row, Tag, Typography } from "antd";
import { ScrollSideMenuProps } from "@mds/common/components/common/ScrollSideMenu";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";

import * as routes from "@/constants/routes";
import { ArrowLeftOutlined } from "@ant-design/icons";

const ReportPage: FC = () => {
  const dispatch = useDispatch();
  const { mineGuid, reportGuid } = useParams<{ mineGuid: string; reportGuid: string }>();
  const mineReport: IMineReport = useSelector((state) => getMineReportById(state, reportGuid));
  const mine = useSelector((state) => getMineById(state, mineGuid));

  const [loaded, setIsLoaded] = useState(Boolean(mineReport && mine));
  const [isEditMode, setIsEditMode] = useState(false);

  const formErrors = useSelector(getFormSubmitErrors(FORM.VIEW_EDIT_REPORT));
  const formValues = useSelector(getFormValues(FORM.VIEW_EDIT_REPORT));

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

  const getToggleEditButton = () => {
    return isEditMode ? (
      <Row justify="end">
        <Button onClick={() => setIsEditMode(false)} disabled={isFormDirty}>
          View Report
        </Button>
        {/* <Button htmlType="submit" type="primary">
          Save Changes
        </Button> */}
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
    <>
      <div className="padding-lg">
        <Typography.Title level={1}>
          Report Name
          <span>
            <Tag title="mine name">tag content</Tag>
          </span>
        </Typography.Title>
        <Link to="https://www.google.ca">
          <ArrowLeftOutlined />
          Back to: Reports
        </Link>
      </div>
    </>
  );

  const PageContent = (
    <>
      <div style={{ backgroundColor: "green", width: "100%", height: "40px" }}>test alignment</div>
      {getToggleEditButton()}
      <ReportDetailsForm
        mineGuid={mineGuid}
        initialValues={mineReport}
        handleSubmit={(values) => console.log(values)}
        isEditMode={isEditMode}
        formButtons={
          isEditMode ? (
            <Button htmlType="submit" type="primary">
              Save Changes
            </Button>
          ) : null
        }
      />
      {!isEditMode && getToggleEditButton()}
    </>
  );

  return loaded ? (
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
