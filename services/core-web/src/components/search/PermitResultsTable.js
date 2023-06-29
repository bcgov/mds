import React from "react";
import { Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";
import CoreTable from "@/components/common/CoreTable";
import { renderHighlightedTextColumn, renderTextColumn } from "../common/CoreTableCommonColumns";

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
    renderHighlightedTextColumn("permit_no", "Permit No.", props.highlightRegex),
    renderHighlightedTextColumn("current_permittee", "Permittee", props.highlightRegex),
    renderTextColumn("current_permittee", "Permittee"),
    {
      title: "Mine(s)",
      key: "mine_guid",
      render: (record) => {
        return record.mine.map((mine) => (
          <Link
            to={router.MINE_PERMITS.dynamicRoute(mine.mine_guid)}
            key={"mine-link-" + mine.mine_guid}
          >
            <Highlight search={props.highlightRegex}>{mine.mine_name}</Highlight>
          </Link>
        ));
      },
    },
  ];

  return (
    <div className="padding-lg--bottom">
      <h2>{props.header}</h2>
      <Divider />
      <CoreTable columns={columns} dataSource={props.searchResults} />
    </div>
  );
};

PermitResultsTable.propTypes = propTypes;
PermitResultsTable.defaultProps = defaultProps;

export default PermitResultsTable;
