import React, { FC, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Row, Col, Typography } from "antd";
import { formatDate } from "@common/utils/helpers";
import { fetchMineComplianceInfo } from "@mds/common/redux/actionCreators/complianceActionCreator";
import { getMineComplianceInfo } from "@mds/common/redux/selectors/complianceSelectors";
import InspectionsTable from "@/components/dashboard/mine/inspections/InspectionsTable";
import TableSummaryCard from "@/components/common/TableSummaryCard";
import * as Strings from "@/constants/strings";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine } from "@mds/common/interfaces/mine.interface";

export const Inspections: FC = () => {
  const dispatch = useDispatch();
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const mineComplianceInfo = useSelector(getMineComplianceInfo);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchMineComplianceInfo(mine.mine_no, true)).then(() => {
      setIsLoaded(true);
    });
  }, []);

  const sortedOrders = (orders) =>
    orders.sort((a, b) => {
      if (a.order_status > b.order_status) return -1;
      if (a.order_status < b.order_status) return 1;
      if (moment(a.due_date) < moment(b.due_date)) return -1;
      if (moment(a.due_date) > moment(b.due_date)) return 1;
      return 0;
    });

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={4}>Inspections</Typography.Title>
        <Typography.Paragraph>
          This table shows your mine&apos;s&nbsp;
          <Typography.Text className="color-primary" strong>
            inspection history
          </Typography.Text>
          &nbsp;since March 2018. Each row represents an individual order.
        </Typography.Paragraph>
        {isLoaded && mineComplianceInfo && (
          <Row justify="space-around" gutter={[16, 16]}>
            <Col sm={24} md={10} lg={6}>
              <TableSummaryCard
                title="Inspections YTD"
                content={mineComplianceInfo.year_to_date.num_inspections}
                icon="check-circle"
                type="success"
              />
            </Col>
            <Col sm={24} md={10} lg={6}>
              <TableSummaryCard
                title="Responses Due"
                content={mineComplianceInfo.num_open_orders}
                icon="exclamation-circle"
                type="warning"
              />
            </Col>
            <Col sm={24} md={10} lg={6}>
              <TableSummaryCard
                title="Overdue Orders"
                content={mineComplianceInfo.num_overdue_orders}
                icon="clock-circle"
                type="error"
              />
            </Col>
            <Col sm={24} md={10} lg={6}>
              <TableSummaryCard
                title="Last Inspection"
                content={
                  mineComplianceInfo.last_inspector ? (
                    <div className="table-summary-card-small-content">
                      <span className="table-summary-card-small-content-title">
                        {mineComplianceInfo.last_inspector}
                      </span>
                      <br />
                      {formatDate(mineComplianceInfo.last_inspection)}
                    </div>
                  ) : (
                    Strings.EMPTY_FIELD
                  )
                }
                icon="file-text"
                type="info"
              />
            </Col>
          </Row>
        )}
        <InspectionsTable
          isLoaded={isLoaded}
          orders={mineComplianceInfo?.orders ? sortedOrders(mineComplianceInfo.orders) : []}
        />
      </Col>
    </Row>
  );
};
export default Inspections;
