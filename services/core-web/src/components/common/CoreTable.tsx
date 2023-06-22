import React from "react";
import { Table, TableProps, Tooltip } from "antd";
import { ColumnType } from "antd/es/table";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import { ExpandableConfig } from "antd/lib/table/interface";

interface CoreTableExpandConfig<T> extends ExpandableConfig<T> {
  getDataSource: (record: T) => any[];
  rowKey?: string | ((record: any) => string);
  recordDescription?: string;
  subTableColumns?: ColumnType<any>[];
  // and any other props from expandable https://4x.ant.design/components/table/#expandable
}

interface CoreTableProps<T> extends TableProps<T> {
  columns: ColumnType<T>[];
  dataSource: T[];
  condition: boolean;
  rowKey?: string | ((record: T) => string | number); // defaults to "key"
  classPrefix?: string;
  emptyText?: string;
  expandProps?: CoreTableExpandConfig<any> | null;
}

const CoreTable = <T,>(props: CoreTableProps<T>) => {
  const {
    columns,
    condition = true,
    pagination = false,
    tableLayout = "auto",
    emptyText = "No Data Yet",
    expandProps = null,
    classPrefix = "",
    ...tableProps
  } = props;

  const skeletonColumns = columns.map((column) => ({
    title: column.title,
    className: column.className,
    width: column.width,
    render: () => <div className={`skeleton-table__loader ${column.className}`} />,
  }));

  const renderTableExpandIcon = ({ expanded, onExpand, record }) => {
    const { rowExpandable, getDataSource, recordDescription = "details" } = expandProps;
    const isRowExpandable = rowExpandable ?? ((rec) => getDataSource(rec).length > 0);
    if (!isRowExpandable(record)) {
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
            title={`Click to hide ${recordDescription}.`}
            placement="right"
            mouseEnterDelay={1}
          >
            <MinusSquareFilled className="icon-lg--lightgrey" />
          </Tooltip>
        ) : (
          <Tooltip
            title={`Click to show ${recordDescription}.`}
            placement="right"
            mouseEnterDelay={1}
          >
            <PlusSquareFilled className="icon-lg--lightgrey" />
          </Tooltip>
        )}
      </a>
    );
  };

  const renderExpandedRow = (record: any) => {
    return (
      <Table
        columns={expandProps.subTableColumns}
        dataSource={expandProps.getDataSource(record)}
        locale={{ emptyText }}
        pagination={false}
        size="small"
        className={`${classPrefix}-nested-table`}
        rowClassName={`${classPrefix}-table-expanded-row fade-in`}
        rowKey={expandProps.rowKey}
      />
    );
  };

  const expansionProps = expandProps
    ? {
        rowExpandable:
          expandProps.rowExpandable ?? ((record) => expandProps.getDataSource(record).length > 0),
        expandIcon: renderTableExpandIcon,
        expandRowByClick: true,
        expandedRowRender: expandProps.expandedRowRender ?? renderExpandedRow,
        ...expandProps,
      }
    : null;
  return condition ? (
    <Table
      expandable={expansionProps}
      pagination={pagination}
      locale={{ emptyText }}
      className={`${classPrefix}-table`}
      tableLayout={tableLayout}
      rowClassName={"fade-in"}
      {...tableProps}
      columns={columns}
    ></Table>
  ) : (
    <Table
      pagination={false}
      columns={skeletonColumns}
      dataSource={Array(pagination ? 25 : 9)}
      rowClassName="skeleton-table__row"
    ></Table>
  );
};

export default CoreTable;
