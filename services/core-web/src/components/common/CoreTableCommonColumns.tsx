import React, { ReactNode } from "react";
import Highlight from "react-highlighter";
import DocumentLink from "./DocumentLink";
import { dateSorter, formatDate, nullableStringSorter } from "@common/utils/helpers";
import { ColumnType } from "antd/lib/table";
import { Tag, Tooltip } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import DocumentActions from "@/components/common/DocumentActions";

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

const documentWithTag = (record: any, elem: ReactNode, title: string) => {
  return (
    <div
      className="inline-flex flex-between file-name-container"
      style={!record.number_of_versions ? { marginLeft: "0" } : { marginLeft: "14px" }}
      title={title}
    >
      {elem}

      <span className="file-history-container">
        {record?.number_of_versions > 0 ? (
          <span>
            <Tooltip
              title={`This file has ${record.number_of_versions} previous versions`}
              placement="top"
              mouseEnterDelay={1}
            >
              <Tag icon={<ClockCircleOutlined />} color="#5E46A1" className="file-version-amount">
                {record.number_of_versions}
              </Tag>
            </Tooltip>
          </span>
        ) : null}
        {record.showArchiveIndicator && record?.is_archived ? <Tag>{"Archived"}</Tag> : null}
      </span>
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
      const recordWithArchiveIndicator = { ...record, showArchiveIndicator };
      const link = (
        <div
          key={record.key ?? record[docManGuidIndex]}
          className={record.number_of_versions !== undefined ? "file-name-text" : ""}
          style={record?.number_of_versions === 0 ? { marginLeft: "38px" } : {}}
        >
          <DocumentLink
            documentManagerGuid={record[docManGuidIndex]}
            documentName={record.document_name ?? text}
            truncateDocumentName={false}
          />
        </div>
      );
      return documentWithTag(recordWithArchiveIndicator, link, title);
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const renderTaggedColumn = (
  dataIndex: string,
  title: string,
  tag = "",
  sortable = false,
  placeHolder = ""
) => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text: any, record: any) => {
      const content = (
        <div
          className={record.number_of_versions !== undefined ? "file-name-text" : ""}
          style={record?.number_of_versions === 0 ? { marginLeft: "38px" } : {}}
        >
          {text ?? placeHolder}
        </div>
      );
      return tag !== "" || record.number_of_versions !== undefined
        ? documentWithTag(record, content, title)
        : withTag(tag, content);
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const actionOperationsColumn = (title = "", dataIndex = "operations") => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text: any, record: any) => {
      return (
        <DocumentActions
          openDocument
          document={{
            documentName: record.document_name,
            documentMangerGuid: record.document_manager_guid,
          }}
        />
      );
    },
  };
};
