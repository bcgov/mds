import React from "react";
import { Table, TableProps, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import { ExpandableConfig, TableRowSelection } from "antd/lib/table/interface";

interface CoreTableExpandConfig<T> extends ExpandableConfig<T> {
  getDataSource?: (record: T) => any[];
  rowKey?: string | ((record: any) => string);
  recordDescription?: string;
  subTableColumns?: ColumnsType<any>;
  showVersionHistory?: boolean;
  // and any other props from expandable https://4x.ant.design/components/table/#expandable
}

interface CoreTableProps<T> extends TableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  condition?: boolean;
  rowKey?: string | ((record: T) => string | number); // defaults to "key"
  classPrefix?: string;
  emptyText?: string;
  expandProps?: CoreTableExpandConfig<any> | null;
  rowSelection?: TableRowSelection<any>;
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

  const tableClass = classPrefix ? classPrefix + "-table" : "";

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
        className={`${tableClass} nested-table`}
        rowClassName={`${tableClass} expanded-row fade-in`}
        rowKey={expandProps.rowKey}
      />
    );
  };

  const getExpansionProps = () => {
    if (expandProps) {
      return expandProps.showVersionHistory
        ? { expandIcon: renderTableExpandIcon, indentSize: 0, ...expandProps }
        : {
            rowExpandable:
              expandProps.rowExpandable ??
              ((record) => expandProps.getDataSource(record).length > 0),
            expandIcon: renderTableExpandIcon,
            expandRowByClick: true,
            expandedRowRender: expandProps.expandedRowRender ?? renderExpandedRow,
            ...expandProps,
          };
    }
    return { showExpandColumn: false };
  };

  return condition ? (
    <Table
      expandable={getExpansionProps()}
      pagination={pagination}
      locale={{ emptyText }}
      className={`${tableClass} core-table`}
      tableLayout={tableLayout}
      rowClassName={
        expandProps?.showVersionHistory
          ? "table-row-align-middle no-sub-table-expandable-rows fade-in"
          : "fade-in"
      }
      {...(expandProps?.showVersionHistory && tableProps?.rowSelection
        ? {
            rowSelection: { ...tableProps.rowSelection },
          }
        : {})}
      columns={columns}
      {...tableProps}
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
