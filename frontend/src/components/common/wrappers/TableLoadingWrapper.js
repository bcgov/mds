import React from "react";
import { PropTypes } from "prop-types";
import { Table } from "antd";

/**
 * @constant TableLoadingWrapper renders react children || or a skeleton loading view using the column headers
 * of the tables and 9 loading rows
 *
 * condition = expecting a truthy value to render children, ie "isLoaded"
 * tableHeaders = array of table headers, the skeleton loading will have the same number of columns and same titles
 * paginationPerPage = if the table is paginated, pass in 'per_page" amount, when changing pages the skeleton will be smooth
 *
 *
 */

const propTypes = {
  condition: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
  tableHeaders: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  paginationPerPage: PropTypes.number,
};

const defaultProps = {
  paginationPerPage: 9,
};

export const TableLoadingWrapper = (props) => {
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
            rowKey={props.tableHeaders.map((title) => title)}
            dataSource={new Array(props.paginationPerPage).fill({})}
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
