import React from "react";
import { PropTypes } from "prop-types";
import { Table, Tooltip } from "antd";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";

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
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  condition: PropTypes.bool.isRequired,
  tableProps: PropTypes.objectOf(PropTypes.any),
  recordType: PropTypes.string,
};

const defaultProps = {
  tableProps: {},
  recordType: "details",
};

export const CoreTable = (props) => {
  const baseProps = {
    pagination: false,
    rowClassName: "fade-in",
    tableLayout: "auto",
  };
  const combinedProps = { ...baseProps, ...props.tableProps };
  const skeletonColumns = props.columns.map((column) => ({
    title: column.title,
    dataIndex: column.title,
    className: column.className,
    width: column.width,
    render: () => <div className={`skeleton-table__loader ${column.className}`} />,
  }));

  const renderTableExpandIcon = ({ expanded, onExpand, record }) => {
    if (props.tableProps.rowExpandable && !props.tableProps.rowExpandable(record)) {
      return null;
    }

    if (!record.numberOfVersions || (record?.numberOfVersions === 0)) {
      return null;
    }

    return (
      <a
        role="link"
        className="expand-row-icon"
        onClick={(e) => onExpand(record, e)}
        style={{ cursor: "pointer" }}
        tabIndex={0}
      >
        {expanded ? (
          <Tooltip
            title={`Click to hide ${props.recordType}.`}
            placement="right"
            mouseEnterDelay={1}
          >
            <MinusSquareFilled className="icon-lg--lightgrey" />
          </Tooltip>
        ) : (
          <Tooltip
            title={`Click to show ${props.recordType}.`}
            placement="right"
            mouseEnterDelay={1}
          >
            <PlusSquareFilled className="icon-lg--lightgrey" />
          </Tooltip>
        )}
      </a>
    );
  };

  return (
    <div>
      {props.condition ? (
        <div>
          <Table
            {...combinedProps}
            expandIcon={combinedProps.expandRowByClick || combinedProps.expandable
              ? renderTableExpandIcon
              : null}
            columns={props.columns}
            dataSource={props.dataSource}
            locale={{ emptyText: "No Data Yet" }}
          />
        </div>
      ) : (
        <div className="skeleton-table">
          <Table
            align="left"
            pagination={false}
            columns={skeletonColumns}
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
