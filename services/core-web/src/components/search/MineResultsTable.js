import React from "react";
import { Table, Row, Col, Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";

/**
 * @class  MineResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  highlightRegex: PropTypes.objectOf(PropTypes.regexp).isRequired,
  query: PropTypes.string.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  showAdvancedLookup: PropTypes.bool.isRequired,
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
              <Highlight search={props.highlightRegex}>{record.mine_name}</Highlight>
            </Link>
          </Col>
        </Row>,
        <Row className="padding-small--top">
          <Col xs={24} md={4}>
            <p>Mine No.</p>
          </Col>
          <Col xs={24} md={4}>
            <p>
              <Highlight search={props.highlightRegex}>{record.mine_no}</Highlight>
            </p>
          </Col>
          <Col xs={24} md={4}>
            <p>Permit No.</p>
          </Col>
          <Col xs={24} md={12}>
            <p>{record.mine_permit.map((permit) => [<span>{permit.permit_no}</span>, <br />])}</p>
          </Col>
          <Col xs={24} md={4}>
            <p>Region</p>
          </Col>
          <Col xs={24} md={4}>
            <p>{record.mine_region}</p>
          </Col>
          <Col xs={24} md={4}>
            <p>Status</p>
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
        className="nested-table padding-large--bottom"
        align="left"
        showHeader={false}
        pagination={false}
        columns={columns}
        dataSource={props.searchResults}
      />
      {props.showAdvancedLookup && (
        <Link
          style={{ float: "right" }}
          className="padding-large--left"
          to={router.MINE_HOME_PAGE.dynamicRoute({
            search: props.query,
            page: Strings.DEFAULT_PAGE,
            per_page: Strings.DEFAULT_PER_PAGE,
          })}
        >
          Advanced lookup for Mines
        </Link>
      )}
    </div>
  );
};

MineResultsTable.propTypes = propTypes;
MineResultsTable.defaultProps = defaultProps;

export default MineResultsTable;
