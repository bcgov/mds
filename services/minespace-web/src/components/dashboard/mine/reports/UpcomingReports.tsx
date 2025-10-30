import React, { FC, useEffect, useState } from "react";
import { Row, Col, Typography, Radio } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";
import ReportsTable, {
  reportStatusSeverity,
} from "@/components/dashboard/mine/reports/ReportsTable";
import { fetchUpcomingMineReports } from "@mds/common/redux/actionCreators/reportActionCreator";
import * as Strings from "@mds/common/constants/strings";
import {
  getUpcomingMineReports,
  getUpcomingReportsPageData,
} from "@mds/common/redux/selectors/reportSelectors";
import { IMineReport } from "@mds/common/interfaces/reports/mineReport.interface";
import { ColumnsType } from "antd/es/table";
import { Badge } from "antd";
import { MINE_REPORT_SUBMISSION_CODES } from "@mds/common/constants/enums";
import { MINE_REPORT_STATUS_HASH } from "@mds/common/constants/strings";
import { PERMIT_VIEW, VIEW_ESUP } from "@/constants/routes";

const REPORTS_PAGE_SIZE = 20;

interface UpcomingReportsProps {
  mineGuid: string;
  openReport: (record: IMineReport, isEditMode?: boolean) => void;
}

const UpcomingReports: FC<UpcomingReportsProps> = ({ mineGuid, openReport }) => {
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [range, setRange] = useState<"90d" | "6m" | "1y">("90d");

  const upcomingReports: IMineReport[] = useAppSelector(getUpcomingMineReports);
  const upcomingPageData = useAppSelector(getUpcomingReportsPageData) as any;

  useEffect(() => {
    onPageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mineGuid]);

  useEffect(() => {
    onPageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const onPageChange = (page: number) => {
    setIsLoaded(false);
    Promise.resolve(
      dispatch(
        fetchUpcomingMineReports(
          mineGuid,
          [
            Strings.MINE_REPORTS_TYPE.codeRequiredReports,
            Strings.MINE_REPORTS_TYPE.permitRequiredReports,
          ],
          { page, per_page: REPORTS_PAGE_SIZE, time_range: range }
        )
      )
    ).then(() => setIsLoaded(true));
  };

  const columns: ColumnsType<IMineReport> = [
    {
      title: "Report Name/Permit Condition",
      dataIndex: "report_name",
      key: "report_name",
      render: (text: string) => text,
    },
    {
      title: "Permit #",
      dataIndex: "permit_number",
      key: "permit_number",
      render: (text: string | null | undefined, record) => {
        if (!text) return "—";
        const permitLink = PERMIT_VIEW.dynamicRoute(record.mine_guid, record.permit_guid);
        return <a href={permitLink}>{text}</a>;
      },
      width: 125,
    },
    {
      title: "Compliance Year",
      dataIndex: "submission_year",
      key: "submission_year",
      width: 80,
    },
    {
      title: "Due",
      dataIndex: "due_date",
      key: "due_date",
      width: 100,
    },
    {
      title: "Submitted",
      key: "submitted_on",
      render: (record: IMineReport) => record?.latest_submission?.received_date || "—",
    },
    {
      title: "Status",
      dataIndex: "mine_report_status_code",
      key: "status",
      sorter: (a: IMineReport, b: IMineReport) =>
        a.mine_report_status_code.localeCompare(b.mine_report_status_code),
      render: (text: MINE_REPORT_SUBMISSION_CODES) => (
        <Badge status={reportStatusSeverity(text)} text={MINE_REPORT_STATUS_HASH[text]} />
      ),
    },
  ];

  return (
    <>
      <Typography.Title level={2}>Upcoming Reports</Typography.Title>
      <Typography.Paragraph>
        This table shows reports with due dates in the future. Use it to focus on what is coming up
        next.
      </Typography.Paragraph>

      <Row className="margin-large--bottom" align="middle" justify="start">
        <Col>
          <Typography.Text strong className="margin-small--right">
            Time Range:
          </Typography.Text>
        </Col>
        <Col>
          <Radio.Group
            className="upcoming-range-selector"
            value={range}
            onChange={(e) => {
              setRange(e.target.value);
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
        isLoaded={isLoaded}
        backendPaginated
        columns={columns}
      />
      <Row justify="center" className="margin-large--bottom">
        <ResponsivePagination
          onPageChange={onPageChange}
          currentPage={Number(upcomingPageData?.current_page || 1)}
          pageTotal={Number(upcomingPageData?.total || (upcomingReports || []).length)}
          itemsPerPage={Number(upcomingPageData?.items_per_page || REPORTS_PAGE_SIZE)}
        />
      </Row>
    </>
  );
};

export default UpcomingReports;
