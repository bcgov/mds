import React from "react";
import { PropTypes } from "prop-types";
import { Table } from "antd";
import { getTableHeaders } from "@common/utils/helpers";
import NullScreen from "@/components/common/NullScreen";

/**
 * @constant CoreTable renders react children or a skeleton loading view using the column headers
 * of the tables and 9 loading rows
 *
 * condition = expecting a truthy value to render children, ie "isLoaded"
 * tableHeaders = array of table headers, the skeleton loading will have the same number of columns and same titles
 * isPaginated = true if the table is paginated - this allows the skeleton to be smooth when changing pages
 *
 *
 */

const propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataSource: PropTypes.objectOf(PropTypes.any).isRequired,
  condition: PropTypes.bool.isRequired,
  tableProps: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  tableProps: {
    locale: { emptyText: <NullScreen type="no-results" /> },
    pagination: false,
    rowClassName: "fade-in",
  },
};

export const CoreTable = (props) => {
  const renderColumns = getTableHeaders(props.columns).map((title) => ({
    title,
    dataIndex: title,
    width: 150,
    render: () => <div className="skeleton-table__loader" />,
  }));
  return (
    <div>
      {props.condition ? (
        <div>
          <Table {...props.tableProps} columns={props.columns} dataSource={props.dataSource} />
        </div>
      ) : (
        <div className="skeleton-table">
          <Table
            align="left"
            pagination={false}
            columns={renderColumns}
            dataSource={new Array(props.tableProps.pagination ? 25 : 9).fill({})}
            rowClassName="skeleton-table__row"
          />
        </div>
      )}
    </div>
  );
};

CoreTable.propTypes = propTypes;
CoreTable.defaultProps = defaultProps;

export default CoreTable;
