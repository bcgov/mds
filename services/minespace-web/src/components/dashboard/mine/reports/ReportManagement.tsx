import React, { FC, useContext, useEffect, useState } from "react";
import { Row, Col, Typography, Tabs, Alert, Button, Badge } from "antd";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine } from "@mds/common/interfaces";
import { getMineReports, getReportsPageData } from "@mds/common/redux/selectors/reportSelectors";
import { IMineReport } from "@mds/common/interfaces/reports/mineReport.interface";
import * as Strings from "@mds/common/constants/strings";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import UpcomingReports from "@/components/dashboard/mine/reports/UpcomingReports";
import { Link, useHistory } from "react-router-dom";
import * as routes from "@/constants/routes";
import TableSummaryCard from "@/components/common/TableSummaryCard";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getMineReportStatsByMineGuid } from "@mds/common/redux/slices/mineReportStatsSlice";
import { fetchMineReports } from "@mds/common/redux/slices/reportSlice";
import { Feature, isFeatureEnabled } from "@mds/common/utils";
import ReportFilterForm from "@mds/common/components/reports/ReportFilterForm";
import { MineReportParams } from "@mds/common/interfaces/reports";
import { getMineReportDefinitionOptions } from "@mds/common/redux/slices/complianceReportsSlice";
import { handleFiltering } from "@mds/common/utils";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";

const REPORTS_PAGE_SIZE = 20;

const defaultParams: MineReportParams = {
  report_name: undefined,
  report_type: undefined,
  compliance_year: undefined,
  due_date_start: undefined,
  due_date_end: undefined,
  received_date_start: undefined,
  received_date_end: undefined,
  received_only: "false",
  requested_by: undefined,
  status: [],
  sort_field: "received_date",
  sort_dir: "desc",
  mine_reports_type: [
    Strings.MINE_REPORTS_TYPE.codeRequiredReports,
    Strings.MINE_REPORTS_TYPE.permitRequiredReports,
  ],
};

const ReportManagement: FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const [isLoaded, setIsLoaded] = useState(false);

  const [allReports, setAllReports] = useState<IMineReport[]>(
    (useAppSelector(getMineReports) as IMineReport[]) || []
  );

  const mineReports: IMineReport[] = useAppSelector(getMineReports);
  const pageData = useAppSelector(getReportsPageData);
  const stats = useAppSelector(getMineReportStatsByMineGuid(mine.mine_guid));
  const showPendingReports = isFeatureEnabled(Feature.REPORT_MANAGEMENT_V2);
  const [stateParams, setStateParams] = useState<MineReportParams>(defaultParams);
  const mine_reports_type = [
    Strings.MINE_REPORTS_TYPE.codeRequiredReports,
    Strings.MINE_REPORTS_TYPE.permitRequiredReports,
  ];
  const mineReportDefinitionOptions = useAppSelector(getMineReportDefinitionOptions);

  useEffect(() => {
    setIsLoaded(true);
    dispatch(fetchPermits(mine?.mine_guid));
    onAllReportsPageChange(1, 20);
  }, [mine.mine_guid]);

  useEffect(() => {
    setAllReports(mineReports);
    const newParams = { ...stateParams, page: "1" };
    setStateParams(newParams);
  }, [mineReports]);

  const activePermits = stats?.active_permits ?? "";
  const reportsOverdue = stats?.overdue_reports ?? "";
  const reportsDueNext90 = stats?.due_next_90_days ?? "";

  const openReport = (reportRecord: IMineReport, isEditMode: boolean) => {
    history.push(
      routes.REPORT_VIEW_EDIT.dynamicRoute(mine.mine_guid, reportRecord.mine_report_guid),
      {
        isEditMode,
      }
    );
  };

  const handleReportFilterSubmit = (params) => {
    const paramsWithCopy = { ...params };
    setStateParams(paramsWithCopy);
    history.replace(routes.MINE_REPORTS.dynamicRoute(mine.mine_guid, paramsWithCopy));
    dispatch(
      fetchMineReports({
        mineGuid: mine.mine_guid,
        reportsType: mine_reports_type,
        params: paramsWithCopy,
      })
    );
  };

  const onAllReportsPageChange = (page, per_page) => {
    setIsLoaded(false);
    const newParams = { ...stateParams, page, per_page };
    setStateParams(newParams);
    handleReportFilterSubmit(newParams);
    handleFiltering(
      mineReports,
      { ...stateParams, page, per_page },
      mineReportDefinitionOptions,
      mine_reports_type,
      false
    );
    setIsLoaded(true);
  };

  const handleReportFilterReset = () => {
    setStateParams({
      ...defaultParams,
    });
    history.replace(routes.MINE_REPORTS.dynamicRoute(mine.mine_guid, defaultParams));
    dispatch(
      fetchMineReports({
        mineGuid: mine.mine_guid,
        reportsType: mine_reports_type,
        params: defaultParams,
      })
    );
  };

  return (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        <Row justify={"space-between"} align={"middle"}>
          <Col>
            <Typography.Title level={1}>Report Management</Typography.Title>
          </Col>
          <Col>
            <Link to={routes.REPORTS_CREATE_NEW.dynamicRoute(mine.mine_guid)}>
              <Button className="dashboard-add-button" type="primary">
                <PlusCircleFilled />
                Submit Report
              </Button>
            </Link>
          </Col>
        </Row>
        <Typography.Paragraph>
          Review and manage reports required for your mine's permit and Health, Safety and
          Reclamation Code obligations.
        </Typography.Paragraph>
      </Col>
      <Col span={24}>
        <Row gutter={[16, 16]}>
          <Col sm={24} md={10} lg={8}>
            <TableSummaryCard
              title="Active Permits"
              content={activePermits}
              Icon={FileTextOutlined}
              type="success"
            />
          </Col>
          <Col sm={24} md={10} lg={8}>
            <TableSummaryCard
              title="Reports Overdue"
              content={reportsOverdue}
              Icon={ClockCircleOutlined}
              type="error"
            />
          </Col>
          <Col sm={24} md={10} lg={8}>
            <TableSummaryCard
              title="Reports Due in the Next 90 Days"
              content={reportsDueNext90}
              Icon={ExclamationCircleOutlined}
              type="warning"
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Tabs
          type="card"
          items={[
            {
              key: "all_reports",
              label: "All Reports",
              children: (
                <div>
                  <Typography.Title level={2}>All Reports</Typography.Title>
                  <Typography.Paragraph>
                    This table shows the reporting requirements for your permits. It highlights
                    overdue, upcoming, and requested reports to help you stay compliant. Drafts and
                    previously submitted reports are also included for your reference.
                  </Typography.Paragraph>

                  <div className="margin-large--bottom">
                    <Alert
                      message="Reminder"
                      showIcon
                      type="info"
                      description={
                        "Your permit is the official source of reporting requirements. Use this table as a reference, but always check your permit to confirm compliance."
                      }
                    />
                  </div>

                  <div className="advanced-search__container">
                    <ReportFilterForm
                      onSubmit={handleReportFilterSubmit}
                      onReset={handleReportFilterReset}
                      initialValues={stateParams}
                      mineReportType={""}
                    />
                  </div>

                  <ReportsTable
                    openReport={openReport}
                    mineReports={allReports}
                    isLoaded={isLoaded}
                    handleTableChange={handleReportFilterSubmit}
                    filters={stateParams}
                    sortField={stateParams.sort_field}
                    sortDir={stateParams.sort_dir}
                    backendPaginated
                  />
                  <Row justify="center" className="margin-large--bottom">
                    <ResponsivePagination
                      onPageChange={onAllReportsPageChange}
                      currentPage={Number(pageData?.current_page || 1)}
                      pageTotal={Number(pageData?.total || allReports.length)}
                      itemsPerPage={Number(pageData?.items_per_page || REPORTS_PAGE_SIZE)}
                    />
                  </Row>
                </div>
              ),
            },
            ...(showPendingReports
              ? [
                  {
                    key: "upcoming_reports",
                    label: (
                      <Row gutter={8}>
                        <Col>Upcoming Reports</Col>
                        <Col>
                          <Badge count={reportsDueNext90 ?? undefined} />
                        </Col>
                      </Row>
                    ),
                    children: <UpcomingReports mineGuid={mine.mine_guid} openReport={openReport} />,
                  },
                ]
              : []),
          ]}
        />
      </Col>
    </Row>
  );
};

export default ReportManagement;
