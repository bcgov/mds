import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Divider, Pagination } from "antd";

import { RED_CLOCK } from "@/constants/assets";
import { formatDate } from "@/utils/helpers";
/**
 * @class  MineTenureInfo - all tenure information related to the mine.
 */

const propTypes = {
  handlePageChange: PropTypes.func.isRequired,
  minOrderList: PropTypes.number.isRequired,
  maxOrderList: PropTypes.number.isRequired,
  openOrders: PropTypes.arrayOf(
    PropTypes.shape({
      overdue: PropTypes.bool.isRequired,
      due_date: PropTypes.string.isRequired,
      order_no: PropTypes.string.isRequired,
      violation: PropTypes.string.isRequired,
      report_no: PropTypes.string.isRequired,
      inspector: PropTypes.string.isRequired,
    })
  ),
};

const defaultProps = {
  openOrders: [],
};

const byDateOrOrderNo = (order1, order2) => {
  const date1 = Date.parse(order1.due_date) || 0;
  const date2 = Date.parse(order2.due_date) || 0;
  return date1 === date2 ? order1.order_no - order2.order_no : date1 - date2;
};

const OpenOrdersTable = (props) =>
  props.openOrders.length > 0 && (
    <div>
      <h2>Open Orders</h2>
      <br />
      <Row gutter={16} justify="center" align="top">
        <Col span={2} />
        <Col span={4}>
          <h5>Order #</h5>
        </Col>
        <Col span={4}>
          <h5>Violation</h5>
        </Col>
        <Col span={4}>
          <h5>Report #</h5>
        </Col>
        <Col span={4}>
          <h5>Inspector Name</h5>
        </Col>
        <Col span={4}>
          <h5>Due Date</h5>
        </Col>
        <Col span={2} />
      </Row>
      <Divider type="horizontal" className="thick-divider" />
      {props.openOrders
        .sort(byDateOrOrderNo)
        .slice(props.minOrderList, props.maxOrderList)
        .map((order, id) => (
          <div key={order.order_no}>
            <Row gutter={16} justify="center" align="top">
              <Col span={2}>
                {order.overdue && order.due_date !== null ? (
                  <img className="padding-small" src={RED_CLOCK} alt="Edit TSF Report" />
                ) : (
                  ""
                )}
              </Col>
              <Col id={`order-no-${id}`} span={4}>
                <h6 className={order.overdue ? "bold" : null}>
                  {order.order_no === null ? "-" : order.order_no}
                </h6>
              </Col>
              <Col id={`violation-${id}`} span={4}>
                <h6 className={order.overdue ? "bold" : null}>
                  {order.violation === null ? "-" : order.violation}
                </h6>
              </Col>
              <Col id={`Report-${id}`} span={4}>
                <h6 className={order.overdue ? "bold" : null}>
                  {order.report_no === null ? "-" : order.report_no}
                </h6>
              </Col>
              <Col id={`inspector-${id}`} span={4}>
                <h6 className={order.overdue ? "bold" : null}>
                  {order.inspector === null ? "-" : order.inspector}
                </h6>
              </Col>
              <Col id={`due-date-${id}`} span={4}>
                <h6 className={order.overdue ? "bold" : null}>
                  {formatDate(order.due_date) || "-"}
                </h6>
              </Col>
              <Col span={4} align="right" />
            </Row>
            <Divider type="horizontal" />
          </div>
        ))}
      <Pagination
        defaultCurrent={1}
        defaultPageSize={10}
        onChange={props.handlePageChange}
        total={props.openOrders.length}
        className="center"
      />
    </div>
  );

OpenOrdersTable.propTypes = propTypes;
OpenOrdersTable.defaultProps = defaultProps;

export default OpenOrdersTable;
