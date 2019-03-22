import React from "react";
import { Table, Menu, Dropdown, Button, Icon, Col, Divider } from "antd";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { connect } from "react-redux";

/**
 * @class  ContactResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {};

const columns = [
  {
    title: "Party Guid",
    dataIndex: "party_guid",
    key: "party_guid",
    render: (text, record) => <div>{record.name}</div>,
  },
];

export const ContactResultsTable = (props) => (
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

ContactResultsTable.propTypes = propTypes;
ContactResultsTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(ContactResultsTable);
