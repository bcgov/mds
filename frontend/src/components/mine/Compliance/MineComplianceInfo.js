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
import ComplianceOrdersTable from "@/components/mine/Compliance/ComplianceOrdersTable";
import MineComplianceCard from "@/components/mine/Compliance/MineComplianceCard";
import MineComplianceFilterForm from "@/components/mine/Compliance/MineComplianceFilterForm";

/**
 * @class  MineComplianceInfo - all compliance information related to the mine.
 */

const propTypes = {
  handleComplianceFilter: PropTypes.func.isRequired,
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  filteredOrders: CustomPropTypes.complianceOrders.isRequired,
  complianceFilterParams: CustomPropTypes.complianceFilterOptions,
  isLoading: PropTypes.bool,
};

const defaultProps = {
  mineComplianceInfo: {},
  complianceFilterParams: {},
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

  renderComplianceContent = () => (
    <div>
      {this.props.mineComplianceInfo && this.props.mineComplianceInfo.last_inspection ? (
        <div>
          <h4>COMPLIANCE OVERVIEW</h4>
          <Divider />
          <div className="compliance--container">
            <div className="compliance--content">
              {/* backend will be updated in this PR to include these values */}
              <MineComplianceCard title="Count of inspections (Past 12 months)" content="N/A" />
              <MineComplianceCard
                title="Count of inspections (Since april 1, 2018)"
                content="N/A"
              />
              <MineComplianceCard
                title="Last inspection date"
                content={formatDate(this.props.mineComplianceInfo.last_inspection)}
              />
              <MineComplianceCard
                title="IDIR of last inspector to inspect site"
                content={this.props.mineComplianceInfo.last_inspector}
              />
              <MineComplianceCard
                title="Open orders"
                icon={DOC}
                content={this.props.mineComplianceInfo.num_open_orders}
              />
              <MineComplianceCard
                title="Overdue orders"
                icon={OVERDUEDOC}
                content={this.props.mineComplianceInfo.num_overdue_orders}
              />
              <MineComplianceCard
                title="Warnings issued in the past 12 months"
                content={this.props.mineComplianceInfo.warnings}
              />
              <MineComplianceCard
                title="Advisories issued in the past 12 months"
                content={this.props.mineComplianceInfo.advisories}
              />
            </div>
          </div>
          {this.props.mineComplianceInfo.open_orders &&
            this.props.mineComplianceInfo.open_orders.length > 0 && (
              <div>
                <br />
                <h4>INSPECTION ORDERS</h4>
                <Divider />
                <div className="compliance-filter--content">
                  <h4>Filter By</h4>
                  <MineComplianceFilterForm
                    complianceCodes={this.props.complianceCodes}
                    onSubmit={this.props.handleComplianceFilter}
                    initialValues={this.props.complianceFilterParams}
                  />
                </div>
                <ComplianceOrdersTable
                  filteredOrders={this.props.filteredOrders}
                  handlePageChange={this.handlePageChange}
                  minOrderList={this.state.minOrderList}
                  maxOrderList={this.state.maxOrderList}
                />
              </div>
            )}
        </div>
      ) : (
        <NullScreen type="compliance" />
      )}
    </div>
  );

  render() {
    return (
      <div>{this.props.isLoading ? <Loading /> : <div>{this.renderComplianceContent()}</div>}</div>
    );
  }
}

MineComplianceInfo.propTypes = propTypes;
MineComplianceInfo.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineComplianceInfo: getMineComplianceInfo(state),
});

export default connect(mapStateToProps)(MineComplianceInfo);
