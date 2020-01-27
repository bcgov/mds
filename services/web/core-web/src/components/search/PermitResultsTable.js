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
  highlightRegex: PropTypes.objectOf(PropTypes.regexp).isRequired,
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
        <Row>
          <Col span={24}>
            <Link to={router.MINE_PERMITS.dynamicRoute(record.mine_guid)}>
              <Highlight search={props.highlightRegex}>{record.permit_no}</Highlight>
            </Link>
          </Col>
          <Col xs={24} md={6}>
            <p>Permittee</p>
          </Col>
          <Col xs={24} md={18}>
            <p>
              <Highlight search={props.highlightRegex}>{record.current_permittee}</Highlight>
            </p>
          </Col>
          <Col xs={24} md={6}>
            <p>Mine</p>
          </Col>
          <Col xs={24} md={18}>
            <p>{record.mine_name}</p>
          </Col>
        </Row>,
      ],
    },
  ];

  return (
    <div>
      <h2>{props.header}</h2>
      <Divider />
      <Table
        className="nested-table padding-large--bottom"
        align="left"
        showHeader={false}
        pagination={false}
        columns={columns}
        dataSource={props.searchResults}
      />
    </div>
  );
};

PermitResultsTable.propTypes = propTypes;
PermitResultsTable.defaultProps = defaultProps;

export default PermitResultsTable;
