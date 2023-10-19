import React, { ReactNode } from "react";
import Highlight from "react-highlighter";
import { dateSorter, formatDate, nullableStringSorter } from "@common/utils/helpers";
import { ColumnType } from "antd/lib/table";
import { Button, Dropdown } from "antd";
import { CARAT } from "@/constants/assets";
import { generateActionMenuItems } from "./ActionMenu";

export const renderTextColumn = (
  dataIndex: string,
  title: string,
  sortable = false,
  placeHolder = "",
  width?: number
): ColumnType<any> => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text: string) => <div title={title}>{text ?? placeHolder}</div>,
    ...(width !== undefined ? { width } : null),
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const renderDateColumn = (
  dataIndex: string,
  title = "Date",
  sortable = false,
  format: (date: any) => string | null = null,
  placeHolder = ""
) => {
  const formatFunction = format ?? formatDate;
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text) => <div title={title}>{formatFunction(text) || placeHolder}</div>,
    ...(sortable ? { sorter: dateSorter(dataIndex) } : null),
  };
};

export const renderCategoryColumn = (
  dataIndex: string,
  title: string,
  categoryMap: any,
  sortable = false,
  placeHolder = ""
) => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text: string) => <div title={title}>{categoryMap[text] ?? placeHolder}</div>,
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const renderHighlightedTextColumn = (
  dataIndex: string,
  title: string,
  regex: string,
  sortable = true
): ColumnType<any> => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text: string) => {
      return <Highlight search={regex}>{text}</Highlight>;
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export interface ITableAction {
  key: string;
  label: string;
  clickFunction: (event, record) => any;
  icon?: ReactNode;
}

export const renderActionsColumn = (
  actions: ITableAction[],
  recordActionsFilter: (record, actions) => ITableAction[],
  isRowSelected = false,
  text = "Actions",
  dropdownAltText = "Menu"
) => {
  return {
    key: "actions",
    render: (record) => {
      const filteredActions = recordActionsFilter ? recordActionsFilter(record, actions) : actions;
      const items = generateActionMenuItems(filteredActions, record);

      return (
        <div>
          {items.length > 0 && (
            <Dropdown menu={{ items }} placement="bottomLeft" disabled={isRowSelected}>
              {/* // TODO: change button classname to something generic */}
              <Button data-cy="menu-actions-button" className="permit-table-button">
                {text}
                <img
                  className="padding-sm--right icon-svg-filter"
                  src={CARAT}
                  alt={dropdownAltText}
                  style={{ paddingLeft: "5px" }}
                />
              </Button>
            </Dropdown>
          )}
        </div>
      );
    },
  };
};
