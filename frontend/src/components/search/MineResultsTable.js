import React from "react";
import { Table, Menu, Dropdown, Button, Icon, Col, Divider } from "antd";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { connect } from "react-redux";

/**
 * @class  MineResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {};

const columns = [
  {
    title: "Mine Guid",
    dataIndex: "guid",
    key: "guid",
    render: (text, record) => (
      <div>
        {record.mine_name}
        {record.mine_no}
      </div>
    ),
  },
];

export const MineResultsTable = (props) => (
  <Col md={12} sm={24} style={{ padding: "30px", paddingBottom: "60px" }}>
    <h2>{props.header}</h2>
    <Divider />
    <Table
      className="nested-table"
      align="left"
      showHeader={false}
      pagination={false}
      columns={columns}
      dataSource={props.searchResults}
    />
  </Col>
);

const mapStateToProps = (state) => ({});

MineResultsTable.propTypes = propTypes;
MineResultsTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineResultsTable);
