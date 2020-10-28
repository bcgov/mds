import React from "react";
import { Table, Divider, Descriptions } from "antd";
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
        <Descriptions
          title={
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>
              <Highlight search={props.highlightRegex}>{record.mine_name}</Highlight>
            </Link>
          }
        >
          <Descriptions.Item label="Legacy Alias">
            <Highlight search={props.highlightRegex}>{record.mms_alias}</Highlight>
          </Descriptions.Item>
          <Descriptions.Item label="Mine No.">
            <Highlight search={props.highlightRegex}>{record.mine_no}</Highlight>
          </Descriptions.Item>
          <Descriptions.Item label="Permit No.">
            {record.mine_permit.map((permit) => [<span>{permit.permit_no}</span>, <br />])}
          </Descriptions.Item>
          <Descriptions.Item label="Region">{record.mine_region}</Descriptions.Item>
          <Descriptions.Item label="Status">
            {record.mine_status[0] && record.mine_status[0].status_labels.join(", ")}
          </Descriptions.Item>
        </Descriptions>,
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
          className="padding-large--left float-right"
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
