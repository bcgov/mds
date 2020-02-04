// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col, Typography } from "antd";
import CustomPropTypes from "@/customPropTypes";
import InspectionsTable from "@/components/dashboard/mine/inspections/InspectionsTable";
import TableSummaryCard from "@/components/common/TableSummaryCard";
import { fetchMineComplianceInfo } from "@common/actionCreators/complianceActionCreator";
import { getMineComplianceInfo } from "@common/selectors/complianceSelectors";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineComplianceInfo: CustomPropTypes.mineComplianceInfo.isRequired,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
};

const defaultProps = {};

export class Inspections extends Component {
  // TODO: Accurately set isLoaded when file is more properly implemented.
  state = { isLoaded: false };

  componentDidMount = () => {
    this.props.fetchMineComplianceInfo(this.props.mine.mine_no, true).then((data) => {
      this.setState({
        isLoaded: true,
      });
    });
  };

  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Inspections</Title>
          <Paragraph>
            This table shows your mine's&nbsp;
            <Text className="color-primary" strong>
              inspection history
            </Text>
            &nbsp;since March 2018. Each row represents an individual order.
          </Paragraph>
          {this.state.isLoaded && (
            <Row type="flex" justify="space-around" gutter={[{ lg: 0, xl: 32 }, 32]}>
              <Col lg={24} xl={8} xxl={6}>
                <TableSummaryCard
                  title="Inspections YTD"
                  content={this.props.mineComplianceInfo.year_to_date.num_inspections}
                  icon="check-circle"
                  type="success"
                />
              </Col>
              <Col lg={24} xl={8} xxl={6}>
                <TableSummaryCard
                  title="Responses Due"
                  content={this.props.mineComplianceInfo.num_open_orders}
                  icon="exclamation-circle"
                  type="warning"
                />
              </Col>
              <Col lg={24} xl={8} xxl={6}>
                <TableSummaryCard
                  title="Overdue Orders"
                  content={this.props.mineComplianceInfo.num_overdue_orders}
                  icon="clock-circle"
                  type="error"
                />
              </Col>
            </Row>
          )}
          <InspectionsTable
            isLoaded={this.state.isLoaded}
            orders={
              this.props.mineComplianceInfo.orders ? this.props.mineComplianceInfo.orders : []
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
Inspections.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Inspections);
