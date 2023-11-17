import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import PropTypes from "prop-types";
import { Row, Col, Typography } from "antd";
import { formatDate } from "@common/utils/helpers";
import { fetchMineComplianceInfo } from "@mds/common/redux/actionCreators/complianceActionCreator";
import { getMineComplianceInfo } from "@mds/common/redux/selectors/complianceSelectors";
import CustomPropTypes from "@/customPropTypes";
import InspectionsTable from "@/components/dashboard/mine/inspections/InspectionsTable";
import TableSummaryCard from "@/components/common/TableSummaryCard";
import * as Strings from "@/constants/strings";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo.isRequired,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
};

export class Inspections extends Component {
  state = { isLoaded: false };

  componentDidMount = () => {
    this.props.fetchMineComplianceInfo(this.props.mine.mine_no, true).then(() => {
      this.setState({
        isLoaded: true,
      });
    });
  };

  render() {
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
          {this.state.isLoaded && this.props.mineComplianceInfo && (
            <Row type="flex" justify="space-around" gutter={[16, 16]}>
              <Col sm={24} md={10} lg={6}>
                <TableSummaryCard
                  title="Inspections YTD"
                  content={this.props.mineComplianceInfo.year_to_date.num_inspections}
                  icon="check-circle"
                  type="success"
                />
              </Col>
              <Col sm={24} md={10} lg={6}>
                <TableSummaryCard
                  title="Responses Due"
                  content={this.props.mineComplianceInfo.num_open_orders}
                  icon="exclamation-circle"
                  type="warning"
                />
              </Col>
              <Col sm={24} md={10} lg={6}>
                <TableSummaryCard
                  title="Overdue Orders"
                  content={this.props.mineComplianceInfo.num_overdue_orders}
                  icon="clock-circle"
                  type="error"
                />
              </Col>
              <Col sm={24} md={10} lg={6}>
                <TableSummaryCard
                  title="Last Inspection"
                  content={
                    this.props.mineComplianceInfo.last_inspector ? (
                      <div className="table-summary-card-small-content">
                        <span className="table-summary-card-small-content-title">
                          {this.props.mineComplianceInfo.last_inspector}
                        </span>
                        <br />
                        {formatDate(this.props.mineComplianceInfo.last_inspection)}
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
            isLoaded={this.state.isLoaded}
            orders={
              this.props.mineComplianceInfo && this.props.mineComplianceInfo.orders
                ? sortedOrders(this.props.mineComplianceInfo.orders)
                : []
            }
          />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  mineComplianceInfo: getMineComplianceInfo(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchMineComplianceInfo }, dispatch);

Inspections.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Inspections);
