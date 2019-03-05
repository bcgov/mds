import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Divider, Pagination } from "antd";
import { connect } from "react-redux";

import * as String from "@/constants/strings";
import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import { RED_CLOCK } from "@/constants/assets";
import { formatDate } from "@/utils/helpers";
/**
 * @class  MineTenureInfo - all tenure information related to the mine.
 */

const propTypes = {
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  isLoading: PropTypes.bool,
};

const defaultProps = {
  mineComplianceInfo: {},
  isLoading: true,
};

export class MineComplianceInfo extends Component {
  state = { minOrderList: 0, maxOrderList: 10 };

  handlePageChange = (value) => {
    this.setState({
      minOrderList: value <= 1 ? 0 : (value - 1) * 10,
      maxOrderList: value <= 1 ? 10 : value * 10,
    });
  };

  renderOpenOrderList() {
    return (
      this.props.mineComplianceInfo &&
      this.props.mineComplianceInfo.open_orders && (
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
          {this.props.mineComplianceInfo.open_orders
            .sort((order1, order2) => {
              const date1 = Date.parse(order1.due_date) || 0;
              const date2 = Date.parse(order2.due_date) || 0;
              return date1 === date2 ? order1.order_no - order2.order_no : date1 - date2;
            })
            .slice(this.state.minOrderList, this.state.maxOrderList)
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
            onChange={this.handlePageChange}
            total={this.props.mineComplianceInfo.open_orders.length}
            className="center"
          />
        </div>
      )
    );
  }

  render() {
    return (
      <div>
        {this.props.isLoading && <Loading />}
        {!this.props.isLoading && (
          <div>
            {this.props.mineComplianceInfo && (
              <div>
                <Row gutter={16} justify="center" align="top">
                  <Col span={2} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">
                        {formatDate(this.props.mineComplianceInfo.last_inspection) ||
                          String.NO_NRIS_INSPECTIONS}
                      </p>
                      <p className="info-display-label">LAST INSPECTION DATE</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">
                        {this.props.mineComplianceInfo.num_overdue_orders}
                      </p>
                      <p className="info-display-label">OVERDUE ORDERS</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">
                        {this.props.mineComplianceInfo.num_open_orders}
                      </p>
                      <p className="info-display-label">OPEN ORDERS</p>
                    </div>
                  </Col>
                  <Col span={2} />
                </Row>
                <br />
                <br />
                <Row gutter={16} justify="center" align="top">
                  <Col span={2} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">{this.props.mineComplianceInfo.warnings}</p>
                      <p className="info-display-label">WARNINGS ISSUED IN THE PAST YEAR</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">{this.props.mineComplianceInfo.advisories}</p>
                      <p className="info-display-label">ADVISORIES ISSUED IN THE PAST YEAR</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">
                        {this.props.mineComplianceInfo.section_35_orders} - Section 35
                      </p>
                      <p className="info-display-label">TOTAL</p>
                    </div>
                  </Col>
                  <Col span={2} />
                </Row>
              </div>
            )}
            <br />
            <br />
            {this.renderOpenOrderList()}
            {!this.props.mineComplianceInfo && <NullScreen type="generic" />}
          </div>
        )}
      </div>
    );
  }
}

MineComplianceInfo.propTypes = propTypes;
MineComplianceInfo.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineComplianceInfo: getMineComplianceInfo(state),
});

export default connect(mapStateToProps)(MineComplianceInfo);
