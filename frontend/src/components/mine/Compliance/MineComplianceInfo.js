/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Divider } from "antd";
import { OVERDUEDOC, DOC } from "@/constants/assets";
import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import { formatDate, getFiscalYear } from "@/utils/helpers";
import ComplianceOrdersTable from "@/components/mine/Compliance/ComplianceOrdersTable";
import MineComplianceCard from "@/components/mine/Compliance/MineComplianceCard";
import MineComplianceFilterForm from "@/components/mine/Compliance/MineComplianceFilterForm";
import { getMultiSelectComplianceCodes } from "@/selectors/staticContentSelectors";

/**
 * @class  MineComplianceInfo - all compliance information related to the mine.
 */

const propTypes = {
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const initialSearchValues = {
  order_no: "",
  report_no: "",
  due_date: "",
  inspector: "",
  violation: [],
  order_status: "",
};

export class MineComplianceInfo extends Component {
  state = {
    isLoading: false,
    complianceFilterParams: initialSearchValues,
    filteredOrders: [],
  };

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged && !this.state.isLoading) {
      const correctParams = nextProps.location.search
        ? nextProps.location.search
        : queryString.stringify(initialSearchValues);
      this.renderDataFromURL(correctParams);
    }
  }

  renderDataFromURL = (params) => {
    const { violation, ...remainingParams } = queryString.parse(params);
    const formattedParams = {
      violation: formatParamStringToArray(violation),
      ...remainingParams,
    };

    const orders =
      this.props.mineComplianceInfo && this.props.mineComplianceInfo.orders
        ? this.props.mineComplianceInfo.orders
        : [];
    const filteredOrders = orders.filter((order) => this.handleFiltering(order, formattedParams));

    this.setState({
      filteredOrders,
      complianceFilterParams: formattedParams,
    });
  };

  handleFiltering = (order, params) => {
    // convert string to boolean before passing it into a filter check
    const order_status =
      params.order_status === "" || order.order_status.includes(params.order_status);
    const inspector =
      params.inspector === "" ||
      order.inspector.toLowerCase().includes(params.inspector.toLowerCase());
    const date = params.due_date === "" || order.due_date.includes(params.due_date);
    const orderNo = params.order_no === "" || order.order_no.includes(params.order_no);
    const reportNoString = order.report_no.toString();
    const reportNo = params.report_no === "" || reportNoString.includes(params.report_no);
    const violation = params.violation.length === 0 || params.violation.includes(order.violation);
    return order_status && inspector && date && orderNo && reportNo && violation;
  };

  handleComplianceFilter = (values) => {
    if (isEmpty(values)) {
      this.props.history.push(router.MINE_SUMMARY.dynamicRoute(this.props.match.params.id));
    } else {
      const { violation, ...rest } = values;
      this.props.history.push(
        router.MINE_SUMMARY.dynamicRoute(this.props.match.params.id, {
          violation: violation && violation.join(","),
          ...rest,
        })
      );
    }
  };

  renderComplianceContent = () => {
    const fiscalYear = getFiscalYear();
    return (
      <div>
        {this.props.mineComplianceInfo && this.props.mineComplianceInfo.last_inspection ? (
          <div>
            <h4>COMPLIANCE OVERVIEW</h4>
            <Divider />
            <div className="compliance--container">
              <div className="compliance--content">
                <MineComplianceCard
                  title="Count of inspections (Past 12 months)"
                  content={this.props.mineComplianceInfo.last_12_months.num_inspections}
                />
                <MineComplianceCard
                  title={`Count of inspections (Since April 1, ${fiscalYear})`}
                  content={this.props.mineComplianceInfo.current_fiscal.num_inspections}
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
                  content={this.props.mineComplianceInfo.last_12_months.num_warnings}
                />
                <MineComplianceCard
                  title="Advisories issued in the past 12 months"
                  content={this.props.mineComplianceInfo.last_12_months.num_advisories}
                />
              </div>
            </div>
            {this.props.mineComplianceInfo.orders &&
              this.props.mineComplianceInfo.orders.length > 0 && (
                <div>
                  <br />
                  <h4>INSPECTION ORDERS</h4>
                  <Divider />
                  <div className="compliance-filter--content">
                    <h4>Filter By</h4>
                    <MineComplianceFilterForm
                      complianceCodes={this.props.complianceCodes}
                      onSubmit={this.handleComplianceFilter}
                      initialValues={this.state.complianceFilterParams}
                    />
                  </div>
                  <ComplianceOrdersTable filteredOrders={this.state.filteredOrders} />
                </div>
              )}
          </div>
        ) : (
          <NullScreen type="compliance" />
        )}
      </div>
    );
  };

  render() {
    return (
      <div className="tab__content">
        {this.state.isLoading ? <Loading /> : <div>{this.renderComplianceContent()}</div>}
      </div>
    );
  }
}

MineComplianceInfo.propTypes = propTypes;

const mapStateToProps = (state) => ({
  mineComplianceInfo: getMineComplianceInfo(state),
  complianceCodes: getMultiSelectComplianceCodes(state),
});

export default connect(mapStateToProps)(MineComplianceInfo);
