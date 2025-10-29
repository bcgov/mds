import React, { FC, useContext, useEffect, useState } from "react";
import { Row, Col, Typography, Tabs, Alert, Button, Radio } from "antd";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine } from "@mds/common/interfaces";
import { fetchUpcomingMineReports } from "@mds/common/redux/actionCreators/reportActionCreator";
import {
  getMineReports,
  getReportsPageData,
  getUpcomingMineReports,
  getUpcomingReportsPageData,
} from "@mds/common/redux/selectors/reportSelectors";
import { IMineReport } from "@mds/common/interfaces/reports/mineReport.interface";
import * as Strings from "@mds/common/constants/strings";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
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

const REPORTS_PAGE_SIZE = 20;

const ReportManagement: FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [upcomingIsLoaded, setUpcomingIsLoaded] = useState(false);
  const [upcomingRange, setUpcomingRange] = useState<"90d" | "6m" | "1y">("90d");

  const [allReports, setAllReports] = useState<IMineReport[]>(
    (useAppSelector(getMineReports) as IMineReport[]) || []
  );

  const mineReports: IMineReport[] = useAppSelector(getMineReports);
  const pageData = useAppSelector(getReportsPageData) as any;
  const upcomingReports: IMineReport[] = useAppSelector(getUpcomingMineReports);
  const upcomingPageData = useAppSelector(getUpcomingReportsPageData) as any;
  const stats = useAppSelector(getMineReportStatsByMineGuid(mine.mine_guid));

  console.log(upcomingReports);

  useEffect(() => {
    setIsLoaded(true);
    setUpcomingIsLoaded(true);
    onAllReportsPageChange(1);
    onUpcomingReportsPageChange(1);
  }, [mine.mine_guid]);

  useEffect(() => {
    if (mineReports && mineReports.length > 0) {
      setAllReports(mineReports);
    }
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

  const onAllReportsPageChange = (page: number) => {
    setIsLoaded(false);
    Promise.resolve(
      dispatch(
        fetchMineReports({
          mineGuid: mine.mine_guid,
          reportsType: [
            Strings.MINE_REPORTS_TYPE.codeRequiredReports,
            Strings.MINE_REPORTS_TYPE.permitRequiredReports,
          ],
          params: { page, per_page: REPORTS_PAGE_SIZE },
        })
      )
    ).then(() => setIsLoaded(true));
  };

  useEffect(() => {
    if (upcomingRange) {
      onUpcomingReportsPageChange(1);
    }
  }, [upcomingRange]);

  const onUpcomingReportsPageChange = (page: number) => {
    setUpcomingIsLoaded(false);
    Promise.resolve(
      dispatch(
        fetchUpcomingMineReports(
          mine.mine_guid,
          [
            Strings.MINE_REPORTS_TYPE.codeRequiredReports,
            Strings.MINE_REPORTS_TYPE.permitRequiredReports,
          ],
          { page, per_page: REPORTS_PAGE_SIZE, time_range: upcomingRange }
        )
      )
    ).then(() => setUpcomingIsLoaded(true));
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
          <Col sm={24} md={10} lg={6}>
            <TableSummaryCard
              title="Active Permits"
              content={activePermits}
              Icon={FileTextOutlined}
              type="success"
            />
          </Col>
          <Col sm={24} md={10} lg={6}>
            <TableSummaryCard
              title="Reports Overdue"
              content={reportsOverdue}
              Icon={ClockCircleOutlined}
              type="error"
            />
          </Col>
          <Col sm={24} md={10} lg={6}>
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
        <Tabs type="card">
          <Tabs.TabPane tab="All Reports" key="all_reports">
            <Typography.Title level={2}>All Reports</Typography.Title>
            <Typography.Paragraph>
              This table shows the reporting requirements for your permits. It highlights overdue,
              upcoming, and requested reports to help you stay compliant. Drafts and previously
              submitted reports are also included for your reference.
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

            <ReportsTable
              openReport={openReport}
              mineReports={allReports}
              isLoaded={isLoaded}
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
          </Tabs.TabPane>

          <Tabs.TabPane tab="Upcoming Reports" key="upcoming_reports">
            <Typography.Title level={2}>Upcoming Reports</Typography.Title>
            <Typography.Paragraph>
              This table shows reports with due dates in the future. Use it to focus on what is
              coming up next.
            </Typography.Paragraph>

            <Row className="margin-large--bottom" align="middle" justify="start">
              <Col>
                <Typography.Text strong className="margin-small--right">
                  Time Range:
                </Typography.Text>
              </Col>
              <Col>
                <Radio.Group
                  value={upcomingRange}
                  onChange={(e) => {
                    setUpcomingRange(e.target.value);
                  }}
                >
                  <Radio.Button value="90d">90 days</Radio.Button>
                  <Radio.Button value="6m">6 months</Radio.Button>
                  <Radio.Button value="1y">1 year</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>

            <ReportsTable
              openReport={openReport}
              mineReports={upcomingReports || []}
              isLoaded={upcomingIsLoaded}
              backendPaginated
            />
            <Row justify="center" className="margin-large--bottom">
              <ResponsivePagination
                onPageChange={onUpcomingReportsPageChange}
                currentPage={Number(upcomingPageData?.current_page || 1)}
                pageTotal={Number(upcomingPageData?.total || (upcomingReports || []).length)}
                itemsPerPage={Number(upcomingPageData?.items_per_page || REPORTS_PAGE_SIZE)}
              />
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

export default ReportManagement;
