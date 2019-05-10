import React from "react";
import { Table, Row, Col, Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";

/**
 * @class  MineResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  highlightRegex: PropTypes.objectOf(PropTypes.Any).isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {};

export const MineResultsTable = (props) => {
  const columns = [
    {
      title: "Mine Guid",
      dataIndex: "mine_guid",
      key: "mine_guid",
      render: (text, record) => [
        <Row>
          <Col span={24}>
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>
              <p style={{ fontSize: "22px", color: "inherit" }}>
                <Highlight search={props.highlightRegex}>{record.mine_name}</Highlight>
              </p>
            </Link>
          </Col>
        </Row>,
        <Row style={{ paddingTop: "5px" }}>
          <Col xs={24} md={4}>
            <p>Mine No.:</p>
          </Col>
          <Col xs={24} md={4}>
            <p>
              <Highlight search={props.highlightRegex}>{record.mine_no}</Highlight>
            </p>
          </Col>
          <Col xs={24} md={4}>
            <p>Permit No.:</p>
          </Col>
          <Col xs={24} md={12}>
            <p>{record.mine_permit.map((permit) => [<span>{permit.permit_no}</span>, <br />])}</p>
          </Col>
        </Row>,
        <Row style={{ paddingTop: "5px", paddingBottom: "15px" }}>
          <Col xs={24} md={4}>
            <p>Region:</p>
          </Col>
          <Col xs={24} md={4}>
            <p>{record.mine_region}</p>
          </Col>
          <Col xs={24} md={4}>
            <p>Status:</p>
          </Col>
          <Col xs={24} md={12}>
            <p>{record.mine_status[0] && record.mine_status[0].status_labels.join(", ")}</p>
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
        className="nested-table"
        align="left"
        showHeader={false}
        pagination={false}
        columns={columns}
        dataSource={props.searchResults}
      />
    </div>
  );
};

MineResultsTable.propTypes = propTypes;
MineResultsTable.defaultProps = defaultProps;

export default MineResultsTable;
