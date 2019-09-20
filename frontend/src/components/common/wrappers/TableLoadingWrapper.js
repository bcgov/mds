import React from "react";
import { PropTypes } from "prop-types";
import { Table } from "antd";

/**
 * @constant TableLoadingWrapper renders react children || or a skeleton loading view using the column headers
 * of the tables and 9 loading rows
 *
 * condition = expecting a truthy value to render children, ie "isLoaded"
 * tableHeaders = array of table headers, the skeleton loading will have the same number of columns and same titles
 * isPaginated = true if the table is paginated - this allows the skeleton to be smooth when changing pages
 *
 *
 */

const propTypes = {
  condition: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
  tableHeaders: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  isPaginated: PropTypes.bool,
};

const defaultProps = {
  isPaginated: false,
};

export const TableLoadingWrapper = (props) => {
  console.log(props.condition);
  const renderColumns = props.tableHeaders.map((title) => ({
    title,
    dataIndex: title,
    width: 150,
    render: () => <div className="skeleton-table__loader" />,
  }));
  return (
    <div>
      {props.condition ? (
        <div>{props.children}</div>
      ) : (
        <div className="skeleton-table">
          <Table
            align="left"
            pagination={false}
            columns={renderColumns}
            dataSource={new Array(props.isPaginated ? 25 : 9).fill({})}
            rowClassName="skeleton-table__row"
          />
        </div>
      )}
    </div>
  );
};

TableLoadingWrapper.propTypes = propTypes;
TableLoadingWrapper.defaultProps = defaultProps;

export default TableLoadingWrapper;
