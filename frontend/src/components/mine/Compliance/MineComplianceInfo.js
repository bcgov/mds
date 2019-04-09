import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { connect } from "react-redux";

import * as String from "@/constants/strings";
import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import { formatDate } from "@/utils/helpers";
import OpenOrdersTable from "@/components/mine/Compliance/OpenOrdersTable";

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

                <br />
                <br />
                {this.props.mineComplianceInfo.open_orders.length > 0 && (
                  <div>
                    <h2>Open Orders</h2>
                    <br />
                    <OpenOrdersTable
                      openOrders={this.props.mineComplianceInfo.open_orders}
                      handlePageChange={this.handlePageChange}
                      minOrderList={this.state.minOrderList}
                      maxOrderList={this.state.maxOrderList}
                    />
                  </div>
                )}
              </div>
            )}
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
