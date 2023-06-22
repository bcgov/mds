import React from "react";
import Highlight from "react-highlighter";
import DocumentLink from "./DocumentLink";
import { dateSorter, formatDate, nullableStringSorter } from "@common/utils/helpers";
import { ColumnType } from "antd/lib/table";

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
  sortable = false
) => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text) => <div title={title}>{categoryMap[text]}</div>,
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

export const renderDocumentLinkColumn = (
  dataIndex: string,
  title = "File Name",
  sortable = true,
  docManGuidIndex = "document_manager_guid"
): ColumnType<any> => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text = "", record: any) => (
      <div key={record.key ?? record[docManGuidIndex]} title={title}>
        <DocumentLink
          documentManagerGuid={record[docManGuidIndex]}
          documentName={text}
          truncateDocumentName={false}
        />
      </div>
    ),
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};
