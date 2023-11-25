import React, { ReactNode } from "react";
import * as Strings from "@mds/common/constants/strings";
import { Button, Popconfirm, Tag, Tooltip } from "antd";
import { ColumnType } from "antd/lib/table";
import {
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { MineDocument } from "@mds/common/models/documents/document";
import { nullableStringSorter } from "@common/utils/helpers";
import ClockCircleOutlined from "@ant-design/icons/ClockCircleOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DocumentLink from "./DocumentLink";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";

const documentWithTag = (
  record: MineDocument,
  elem: ReactNode,
  title: string,
  showVersions = false
) => {
  return (
    <div
      className="inline-flex flex-between file-name-container"
      style={showVersions && record.number_prev_versions === 0 ? { marginLeft: "38px" } : {}}
      title={title}
    >
      {elem}

      <span className="file-history-container">
        {showVersions && record.number_prev_versions > 0 ? (
          <span>
            <Tooltip
              title={`This file has ${record.number_prev_versions} previous versions`}
              placement="top"
              mouseEnterDelay={1}
            >
              <Tag
                icon={<ClockCircleOutlined />}
                style={{ border: "none" }}
                className="file-version-amount"
              >
                {record.number_prev_versions}
              </Tag>
            </Tooltip>
          </span>
        ) : null}
        {record.is_archived ? <Tag>{"Archived"}</Tag> : null}
      </span>
    </div>
  );
};

export const renderTaggedColumn = (
  dataIndex: string,
  title: string,
  sortable = false,
  placeHolder = ""
) => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text: any, record: MineDocument) => {
      const content = (
        <div className={record.number_prev_versions !== 0 ? "file-name-text" : ""}>
          {text ?? placeHolder}
        </div>
      );
      return documentWithTag(record, content, title);
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const renderDocumentLinkColumn = (
  dataIndex: string,
  title = "File Name",
  sortable = true,
  docManGuidIndex = "document_manager_guid"
): ColumnType<MineDocument> => {
  return {
    title,
    dataIndex,
    key: dataIndex,
    render: (text = "", record: MineDocument) => {
      const link = (
        <div
          key={record.key ?? record[docManGuidIndex]}
          className={record.number_prev_versions !== 0 ? "file-name-text" : ""}
        >
          <DocumentLink
            documentManagerGuid={record[docManGuidIndex]}
            documentName={text}
            truncateDocumentName={false}
          />
        </div>
      );
      return documentWithTag(record, link, title);
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const documentNameColumn = (
  documentNameColumnIndex = "document_name",
  title = "File Name",
  minimalView = false
) => {
  return minimalView
    ? renderTaggedColumn(documentNameColumnIndex, title)
    : renderDocumentLinkColumn(documentNameColumnIndex, title, true);
};

export const documentNameColumnNew = (
  dataIndex = "document_name",
  title = "File Name",
  sortable = true,
  showVersions = true
) => {
  return {
    title: showVersions ? <span style={{ marginLeft: "38px" }}>{title}</span> : title,
    dataIndex,
    key: dataIndex,
    render: (text: string, record: MineDocument) => {
      const docLink = (
        <a
          style={record?.number_prev_versions > 0 ? { marginLeft: "14px" } : {}}
          onClick={() => downloadFileFromDocumentManager(record)}
        >
          {text}
        </a>
      );
      return documentWithTag(record, docLink, "File Name", showVersions);
    },
    ...(sortable ? { sorter: nullableStringSorter(dataIndex) } : null),
  };
};

export const uploadDateColumn = (
  uploadDateIndex = "upload_date",
  title = "Uploaded",
  sortable = true
) => {
  return renderDateColumn(uploadDateIndex, title, sortable, null, Strings.EMPTY_FIELD);
};

export const uploadedByColumn = (
  uploadedByIndex = "update_user",
  title = "Uploaded By",
  sortable = true
) => {
  return renderTextColumn(uploadedByIndex, title, sortable);
};

export const removeFunctionColumn = (
  removeFunction,
  documentParent = "",
  documentNameColumnIndex = "document_name"
) => {
  return {
    key: "remove",
    render: (record) => (
      <div>
        <Popconfirm
          placement="topLeft"
          title={`Are you sure you want to delete ${record[documentNameColumnIndex]}?`}
          onConfirm={(event) => removeFunction(event, record.key, documentParent)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button ghost type="primary" size="small">
            <DeleteOutlined className="violet" />
            {/* <img src={TRASHCAN} alt="remove" style={{ width: "24px" }} /> */}
          </Button>
        </Popconfirm>
      </div>
    ),
  };
};
