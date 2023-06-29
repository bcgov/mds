import React from "react";
import { Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import { nullableStringSorter } from "@common/utils/helpers";
import { renderHighlightedTextColumn, renderTextColumn } from "../common/CoreTableCommonColumns";
import CoreTable from "@/components/common/CoreTable";

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
      title: "Mine Name",
      dataIndex: "mine_name",
      key: "mine_name",
      render: (text, record) => (
        <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>
          <Highlight search={props.highlightRegex}>{text}</Highlight>
        </Link>
      ),
      sorter: nullableStringSorter("mine_name"),
    },
    renderHighlightedTextColumn("mms_alias", "Legacy Alias", props.highlightRegex),
    renderHighlightedTextColumn("mine_no", "Mine No.", props.highlightRegex),
    {
      title: "Permit No.",
      key: "permit_no",
      render: (record) =>
        record.mine_permit.map((permit) => (
          <p key={"mine-permits" + permit.permit_no}>{permit.permit_no}</p>
        )),
    },
    renderTextColumn("mine_region", "Region"),
    {
      title: "Status",
      key: "status",
      render: (record) => record.mine_status[0] && record.mine_status[0].status_labels.join(", "),
    },
  ];
  return (
    <div className="padding-lg--bottom">
      <h2>{props.header}</h2>
      <Divider />
      <CoreTable columns={columns} dataSource={props.searchResults} />
      {props.showAdvancedLookup && (
        <Link
          className="padding-lg--left float-right"
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
