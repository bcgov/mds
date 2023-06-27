import React from "react";
import * as Strings from "@common/constants/strings";
import { Button, Popconfirm } from "antd";
import { TRASHCAN } from "@/constants/assets";
import {
  renderDateColumn,
  renderDocumentLinkColumn,
  renderTextColumn,
} from "./CoreTableCommonColumns";

export const documentNameColumn = (
  documentNameColumnIndex = "document_name",
  title = "File Name"
) => {
  return renderDocumentLinkColumn(documentNameColumnIndex, title, true);
};

export const uploadDateColumn = (uploadDateIndex = "upload_date", title = "Uploaded") => {
  return renderDateColumn(uploadDateIndex, title, true, null, Strings.EMPTY_FIELD);
};

export const uploadedByColumn = (uploadedByIndex = "update_user", title = "Uploaded By") => {
  return renderTextColumn(uploadedByIndex, title);
};

export const removeFunctionColumn = (
  removeFunction,
  hideColumn = false,
  documentNameColumnIndex = "document_name",
  documentParent = ""
) => {
  const className = hideColumn ? "column-hide" : "test";
  return {
    key: "remove",
    className,
    render: (record) => (
      <div align="right" className>
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
