import React, { ReactNode } from "react";
import Highlight from "react-highlighter";
import DocumentLink from "./DocumentLink";
import { dateSorter, formatDate, nullableStringSorter } from "@common/utils/helpers";
import { ColumnType } from "antd/lib/table";
import { Tag } from "antd";

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
    render: (text) => <div title={title}>{categoryMap[text] ?? placeHolder}</div>,
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

const withTag = (text: string, elem: ReactNode) => {
  return (
    <div className="inline-flex flex-between">
      {elem}
      <Tag>{text}</Tag>
    </div>
  );
};

export const renderDocumentLinkColumn = (
  dataIndex: string,
  title = "File Name",
  sortable = true,
  docManGuidIndex = "document_manager_guid",
  showArchiveIndicator = true
): ColumnType<any> => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text = "", record: any) => {
      const link = (
        <div key={record.key ?? record[docManGuidIndex]} title={title}>
          <DocumentLink
            documentManagerGuid={record[docManGuidIndex]}
            documentName={text}
            truncateDocumentName={false}
          />
        </div>
      );
      return showArchiveIndicator && record.is_archived ? withTag("Archived", link) : link;
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const renderTaggedColumn = (
  dataIndex: string,
  title: string,
  tag: string,
  sortable = false,
  placeHolder = ""
) => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text: any) => {
      const content = <div title={title}>{text ?? placeHolder}</div>;
      return withTag(tag, content);
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};
