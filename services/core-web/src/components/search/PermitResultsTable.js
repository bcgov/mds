import React from "react";
import { Table, Divider, Descriptions } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";
import * as Strings from "@common/constants/strings";

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
        <Descriptions
          title={<Highlight search={props.highlightRegex}>{record.permit_no}</Highlight>}
        >
          <Descriptions.Item label="Permittee">
            <Highlight search={props.highlightRegex}>
              {record.current_permittee || Strings.NOT_APPLICABLE}
            </Highlight>
          </Descriptions.Item>
          <Descriptions.Item label="Mine(s)">
            {record.mine.map((mine) => (
              <p>
                <Link to={router.MINE_PERMITS.dynamicRoute(mine.mine_guid)}>
                  <Highlight search={props.highlightRegex}>{mine.mine_name}</Highlight>
                </Link>
              </p>
            ))}
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
    </div>
  );
};

PermitResultsTable.propTypes = propTypes;
PermitResultsTable.defaultProps = defaultProps;

export default PermitResultsTable;
