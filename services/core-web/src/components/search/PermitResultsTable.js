import React from "react";
import { Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  renderHighlightedTextColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common";

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
  const { isFeatureEnabled } = useFeatureFlag();

  const columns = [
    {
      title: "Permit No.",
      key: "permit_no",
      render: (record) => {
        if (isFeatureEnabled(Feature.DIGITIZED_PERMITS)) {
          return (
            <Link
              to={router.VIEW_MINE_PERMIT.dynamicRoute(
                record.mine[0].mine_guid,
                record.permit_guid
              )}
            >
              <Highlight search={props.highlightRegex}>{record.permit_no}</Highlight>
            </Link>
          );
        } else {
          return <Highlight search={props.highlightRegex}>{record.permit_no}</Highlight>;
        }
      },
    },
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
