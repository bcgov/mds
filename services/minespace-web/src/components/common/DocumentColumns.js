import React from "react";
import moment from "moment";
import { dateSorter, formatDate, formatDateTime } from "@common/utils/helpers";
import * as Strings from "@/constants/strings";

export const categoryColumn = (categoryDataIndex, documentCategoryOptionsHash) => {
  return {
    title: "Category",
    key: categoryDataIndex,
    dataIndex: categoryDataIndex,
    render: (text) => <div title="Category">{documentCategoryOptionsHash[text]}</div>,
  };
};

export const uploadDateColumn = (
  uploadDateIndex = "upload_date",
  title = "Uploaded",
  sort = false
) => {
  return {
    title,
    key: uploadDateIndex,
    dataIndex: uploadDateIndex,
    sorter: sort ? dateSorter(uploadDateIndex) : null,
    render: (text) => <div title="Upload Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
  };
};

export const uploadDateTimeColumn = (uploadDateIndex) => {
  return {
    title: "Date/Time",
    key: uploadDateIndex,
    dataIndex: uploadDateIndex,
    sorter: (a, b) => (moment(a.uploadDateIndex) > moment(b.uploadDateIndex) ? -1 : 1),
    render: (text) => <div title="Date/Time">{formatDateTime(text) || Strings.EMPTY_FIELD}</div>,
  };
};

export const importedByColumn = (importedByIndex) => {
  return {
    title: "Imported By",
    key: importedByIndex,
    dataIndex: importedByIndex,
    render: (text) => (text ? <div title="User">{text}</div> : null),
  };
};

export const uploadedByColumn = (title = "Uploaded By", uploadedByIndex = "update_user") => {
  return {
    title,
    key: uploadedByIndex,
    dataIndex: uploadedByIndex,
    render: (text) => (text ? <div title={title}>{text}</div> : null),
  };
};
