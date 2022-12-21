import React from "react";
import moment from "moment";
import {
  dateSorter,
  formatDate,
  formatDateTime,
  nullableStringSorter,
} from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";

export const documentNameColumn = (documentNameColumnIndex, title = "Name") => {
  return {
    title,
    dataIndex: documentNameColumnIndex,
    sorter: nullableStringSorter(documentNameColumnIndex),
    render: (text, record) => (
      <div key={record.key} title={title}>
        <DocumentLink
          documentManagerGuid={record.document_manager_guid}
          documentName={record?.[documentNameColumnIndex]}
          truncateDocumentName={false}
        />
      </div>
    ),
  };
};

export const categoryColumn = (categoryDataIndex, documentCategoryOptionsHash) => {
  return {
    title: "Category",
    dataIndex: categoryDataIndex,
    render: (text) => <div title="Category">{documentCategoryOptionsHash[text]}</div>,
  };
};

export const uploadDateColumn = (uploadDateIndex) => {
  return {
    title: "Upload Date",
    dataIndex: uploadDateIndex,
    sorter: dateSorter(uploadDateIndex),
    render: (text) => <div title="Upload Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
  };
};

export const uploadDateTimeColumn = (uploadDateIndex) => {
  return {
    title: "Date/Time",
    dataIndex: uploadDateIndex,
    sorter: (a, b) => (moment(a.uploadDateIndex) > moment(b.uploadDateIndex) ? -1 : 1),
    render: (text) => <div title="Date/Time">{formatDateTime(text) || Strings.EMPTY_FIELD}</div>,
  };
};

export const uploadedByColumn = (uploadedByIndex, title = "Uploaded") => {
  return {
    title,
    dataIndex: uploadedByIndex,
    render: (text) => (text ? <div title="User">{text}</div> : null),
  };
};
