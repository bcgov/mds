/* eslint-disable */
import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import ResponsivePagination from "@/components/common/ResponsivePagination";
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
          variances={this.props.variances}
          isApplication
          openEditVarianceModal={this.props.openModal}
        />
        <div className="center">
          <ResponsivePagination
            onPageChange={this.props.handlePageChange}
            currentPage={Number(this.props.params.page)}
            pageTotal={this.props.pageData.total}
            itemsPerPage={Number(this.props.params.per_page)}
          />
        </div>
      </div>
    );
  }
}

VarianceTables.propTypes = propTypes;
VarianceTables.defaultProps = defaultProps;

export default VarianceTables;
