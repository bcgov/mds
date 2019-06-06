/* eslint-disable */
import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import MineVarianceTable from "@/components/mine/Variances/MineVarianceTable";

const { TabPane } = Tabs;

/**
 * @class VarianceTables
 */
const propTypes = {};

const defaultProps = {};

export class VarianceTables extends Component {
  render() {
    return (
      <div className="tab__content">
        <h4>Variances</h4>
        <MineVarianceTable
          variances={this.props.variancesInReview}
          isApplication
          isExpanded={this.state.isExpanded}
        />
      </div>
    );
  }
}

VarianceTables.propTypes = propTypes;
VarianceTables.defaultProps = defaultProps;

export default VarianceTables;
