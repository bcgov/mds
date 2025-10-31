import React, { FC, useEffect, useState } from "react";
import { Row, Col, Typography, Radio, Alert } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";
import ReportsTable, {
  reportStatusSeverity,
} from "@/components/dashboard/mine/reports/ReportsTable";
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
import { fetchUpcomingMineReports } from "@mds/common/redux/slices/reportSlice";

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
  }, [mineGuid]);

  useEffect(() => {
    onPageChange(1);
  }, [range]);

  const onPageChange = (page: number) => {
    setIsLoaded(false);
    Promise.resolve(
      dispatch(
        fetchUpcomingMineReports({
          mineGuid,
          reportsType: [
            Strings.MINE_REPORTS_TYPE.codeRequiredReports,
            Strings.MINE_REPORTS_TYPE.permitRequiredReports,
          ],
          params: { page, per_page: REPORTS_PAGE_SIZE, time_range: range },
        })
      )
    ).then(() => setIsLoaded(true));
  };

  return (
    <>
      <Typography.Title level={2}>Upcoming Reports</Typography.Title>
      <Typography.Paragraph>
        This table shows reports that have not yet been submitted to the Ministry. If you do not see
        a permit required report that your mine must submit, click Submit Report, choose the report
        you need to send and then attach the file or files.
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
        mineReports={upcomingReports || []}
        isLoaded={isLoaded}
        backendPaginated
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
