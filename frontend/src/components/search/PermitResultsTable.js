import React from "react";
import { Table, Row, Col, Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";

/**
 * @class  PermitResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  highlightRegex: PropTypes.string.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {};

export const PermitResultsTable = (props) => {
  const columns = [
    {
      title: "Permit Guid",
      dataIndex: "permit_guid",
      key: "permit_guid",
      render: (text, record) => [
        <Row style={{ paddingBottom: "5px" }}>
          <Col span={12}>
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid, "permit")}>
              <p style={{ fontSize: "22px", color: "inherit" }}>
                <Highlight search={props.highlightRegex}>{record.permit_no}</Highlight>
              </p>
            </Link>
          </Col>
        </Row>,
        <Row style={{ paddingTop: "5px" }}>
          <Col span={4}>Permitee</Col>
          <Col span={6}>
            <Highlight search={props.highlightRegex}>{record.permitee}</Highlight>
          </Col>
        </Row>,
        <Row style={{ paddingTop: "5px" }}>
          <Col span={4}>Mine</Col>
          <Col span={10}>{record.mine_name}</Col>
        </Row>,
      ],
    },
  ];

  return (
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
};

PermitResultsTable.propTypes = propTypes;
PermitResultsTable.defaultProps = defaultProps;

export default PermitResultsTable;
