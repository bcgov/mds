import React from "react";
import * as Strings from "@common/constants/strings";
import { Button, Popconfirm } from "antd";
import { TRASHCAN } from "@/constants/assets";
import {
  renderDateColumn,
  renderDocumentLinkColumn,
  renderTaggedColumn,
  renderTextColumn,
} from "./CoreTableCommonColumns";

export const documentNameColumn = (
  documentNameColumnIndex = "document_name",
  title = "File Name",
  minimalView = false
) => {
  return minimalView
    ? renderTaggedColumn(documentNameColumnIndex, title)
    : renderDocumentLinkColumn(documentNameColumnIndex, title, true);
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
      <div align="right">
        <Popconfirm
          placement="topLeft"
          title={`Are you sure you want to delete ${record[documentNameColumnIndex]}?`}
          onConfirm={(event) => removeFunction(event, record.key, documentParent)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button ghost type="primary" size="small">
            <img src={TRASHCAN} alt="remove" style={{ width: "24px" }} />
          </Button>
        </Popconfirm>
      </div>
    ),
  };
};
