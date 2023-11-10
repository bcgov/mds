import React, { Component } from "react";
import queryString from "query-string";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Divider } from "antd";
import { isEmpty } from "lodash";
import { formatParamStringToArray, formatDate, getFiscalYear } from "@common/utils/helpers";
import { fetchMineComplianceInfo } from "@mds/common/redux/actionCreators/complianceActionCreator";
import { getMultiSelectComplianceCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { getMines, getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import { getMineComplianceInfo } from "@mds/common/redux/selectors/complianceSelectors";
import { OVERDUEDOC, DOC } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import ComplianceOrdersTable from "@/components/mine/Compliance/ComplianceOrdersTable";
import MineDashboardContentCard from "@/components/mine/MineDashboardContentCard";
import MineComplianceFilterForm from "@/components/mine/Compliance/MineComplianceFilterForm";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

/**
 * @class  MineComplianceInfo - all compliance information related to the mine.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

const defaultProps = {
  mineComplianceInfo: {},
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
    isLoaded: false,
    complianceFilterParams: initialSearchValues,
    filteredOrders: [],
  };

  componentDidMount() {
    const mine = this.props.mines[this.props.mineGuid];
    this.props.fetchMineComplianceInfo(mine.mine_no, true).then((data) => {
      this.setState({
        isLoaded: true,
        filteredOrders: data && data.orders ? data.orders : [],
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      const correctParams = nextProps.location.search
        ? nextProps.location.search
        : queryString.stringify(initialSearchValues);
      this.renderDataFromURL(correctParams);
    }
  }

  componentWillUnmount() {
    this.setState({ complianceFilterParams: initialSearchValues });
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
    const date =
      params.due_date === "" ||
      (order.due_date !== null && order.due_date.includes(params.due_date));
    const orderNo = params.order_no === "" || order.order_no.includes(params.order_no);
    const reportNoString = order.report_no.toString();
    const reportNo = params.report_no === "" || reportNoString.includes(params.report_no);
    const violation = params.violation.length === 0 || params.violation.includes(order.violation);
    return order_status && inspector && date && orderNo && reportNo && violation;
  };

  handleComplianceFilter = (values) => {
    if (isEmpty(values)) {
      this.props.history.push(routes.MINE_INSPECTIONS.dynamicRoute(this.props.match.params.id));
    } else {
      const { violation, ...rest } = values;
      this.props.history.push(
        routes.MINE_INSPECTIONS.dynamicRoute(this.props.match.params.id, {
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
        <div>
          <h4>COMPLIANCE OVERVIEW</h4>
          <Divider />
          <div className="compliance--container">
            <LoadingWrapper condition={this.state.isLoaded}>
              <div>
                {this.props.mineComplianceInfo && this.props.mineComplianceInfo.last_inspection ? (
                  <div className="dashboard--cards">
                    <MineDashboardContentCard
                      title="Inspections - Past 12 months"
                      content={this.props.mineComplianceInfo.last_12_months.num_inspections}
                    />
                    <MineDashboardContentCard
                      title={`Inspections - Since April 1, ${fiscalYear}`}
                      content={this.props.mineComplianceInfo.current_fiscal.num_inspections}
                    />
                    <MineDashboardContentCard
                      title="Last inspected"
                      content={formatDate(this.props.mineComplianceInfo.last_inspection)}
                    />
                    <MineDashboardContentCard
                      title="Last inspector (IDIR)"
                      content={this.props.mineComplianceInfo.last_inspector}
                    />
                    <MineDashboardContentCard
                      title="Open orders"
                      icon={DOC}
                      content={this.props.mineComplianceInfo.num_open_orders}
                    />
                    <MineDashboardContentCard
                      title="Overdue orders"
                      icon={OVERDUEDOC}
                      content={this.props.mineComplianceInfo.num_overdue_orders}
                    />
                    <MineDashboardContentCard
                      title="Warnings  - Past 12 months"
                      content={this.props.mineComplianceInfo.last_12_months.num_warnings}
                    />
                    <MineDashboardContentCard
                      title="Advisories - Past 12 months"
                      content={this.props.mineComplianceInfo.last_12_months.num_advisories}
                    />
                  </div>
                ) : (
                  <NullScreen type="compliance" />
                )}
              </div>
            </LoadingWrapper>
          </div>
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
            <ComplianceOrdersTable
              filteredOrders={this.state.filteredOrders}
              isLoaded={this.state.isLoaded}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Inspections and Audits</h2>
          <Divider />
        </div>
        {this.renderComplianceContent()}
      </div>
    );
  }
}

MineComplianceInfo.propTypes = propTypes;
MineComplianceInfo.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineComplianceInfo: getMineComplianceInfo(state),
  complianceCodes: getMultiSelectComplianceCodes(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineComplianceInfo,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MineComplianceInfo);
