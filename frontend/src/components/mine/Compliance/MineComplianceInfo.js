import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Divider } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import { fetchMineComplianceInfo } from "@/actionCreators/complianceActionCreator";
import { RED_CLOCK } from "@/constants/assets";
/**
 * @class  MineTenureInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
  mineComplianceInfo: PropTypes.object,
};

const defaultProps = {
  mine: {},
};

export class MineComplianceInfo extends Component {
  state = { isLoading: true };

  componentDidMount() {
    this.props
      .fetchMineComplianceInfo(this.props.mine.mine_detail[0].mine_no)
      .then(() => this.setState({ isLoading: !this.state.isLoading }));
  }

  render() {
    return (
      <div>
        <div>
          {this.state.isLoading && <Loading />}
          {!this.state.isLoading && (
            <div>
              <h4>Compliance Overview</h4>
              <br />
              <br />
              {this.props.mineComplianceInfo && (
                <div>
                  <Row gutter={16} justify="center" align="top">
                    <Col span={2} />
                    <Col span={4}>
                      <div className="center">
                        <p className="info-display">
                          {moment(this.props.mineComplianceInfo.last_inspection).format(
                            "MMM DD YYYY"
                          )}
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
              {!this.props.mineComplianceInfo && <NullScreen type="generic" />}
            </div>
          )}
        </div>
        <br />
        <br />
        <div>
          {this.props.mineComplianceInfo.open_orders && (
            <div>
              <h4>Open Orders</h4>
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
                  if (!(Date.parse(order1.due_date) === Date.parse(order2.due_date)))
                    return Date.parse(order1.due_date) > Date.parse(order2.due_date) ? 1 : -1;
                  return order1.order_no > order2.order_no ? 1 : -1;
                })
                .map((order, id) => {
                  return (
                    <div key={order.order_no}>
                      <Row gutter={16} justify="center" align="top">
                        <Col span={2}>
                          {order.overdue && order.due_date != null ? (
                            <img style={{ padding: "5px" }} src={RED_CLOCK} alt="Edit TSF Report" />
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
                            {order.due_date === null
                              ? "-"
                              : moment(order.due_date).format("MMMM DD YYYY")}
                          </h6>
                        </Col>
                        <Col span={4} align="right" />
                      </Row>
                      <Divider type="horizontal" />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

MineComplianceInfo.propTypes = propTypes;
MineComplianceInfo.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineComplianceInfo: getMineComplianceInfo(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineComplianceInfo,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineComplianceInfo);
