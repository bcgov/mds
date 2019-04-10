import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Divider } from "antd";
import { OVERDUEDOC, DOC } from "@/constants/assets";
import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import { formatDate } from "@/utils/helpers";
import OpenOrdersTable from "@/components/mine/Compliance/OpenOrdersTable";
import MineComplianceCards from "@/components/mine/Compliance/MineComplianceCards";

/**
 * @class  MineComplianceInfo - all compliance information related to the mine.
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
        {this.props.isLoading ? (
          <Loading />
        ) : (
          <div>
            {/* if this is falsy, than NRIS has no data, checking against mineComplianceInfo will always return true */}
            {this.props.mineComplianceInfo.last_inspection && (
              <div>
                <h4>COMPLIANCE OVERVIEW</h4>
                <Divider />
                <div className="compliance--container">
                  <div className="compliance--content">
                    <MineComplianceCards
                      title="Count of inspections (Past 12 months)"
                      content="200"
                    />
                    <MineComplianceCards
                      title="Count of inspections (Since april 1, 2018)"
                      content="0"
                    />
                    <MineComplianceCards
                      title="Last Inspection Date"
                      content={formatDate(this.props.mineComplianceInfo.last_inspection)}
                    />
                    <MineComplianceCards
                      title="idir of last inspector to inspect site"
                      content={this.props.mineComplianceInfo.last_inspector}
                    />
                    <MineComplianceCards
                      title="open orders"
                      icon={DOC}
                      content={this.props.mineComplianceInfo.num_open_orders}
                    />
                    <MineComplianceCards
                      title="overdue orders"
                      icon={OVERDUEDOC}
                      content={this.props.mineComplianceInfo.num_overdue_orders}
                    />
                    <MineComplianceCards
                      title="Warnings issued in the past 12 months"
                      content={this.props.mineComplianceInfo.warnings}
                    />
                    <MineComplianceCards
                      title="advisories issued in the past 12 months"
                      content={this.props.mineComplianceInfo.advisories}
                    />
                  </div>
                </div>
                {this.props.mineComplianceInfo.open_orders.length > 0 && (
                  <div>
                    <br />
                    <h4>INSPECTION ORDERS</h4>
                    <Divider />
                    {/* <div className="compliance-filter--content">
                      <h4>Filter By</h4>
                      <MineComplianceFilterForm />
                    </div> */}
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
            {!this.props.mineComplianceInfo.last_inspection && <NullScreen type="compliance" />}
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
