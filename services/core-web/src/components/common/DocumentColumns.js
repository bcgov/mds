import React from "react";
import moment from "moment";
import { dateSorter, formatDate, formatDateTime } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";

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

export const importedByColumn = (importedByIndex) => {
  return {
    title: "Imported By",
    dataIndex: importedByIndex,
    render: (text) => (text ? <div title="User">{text}</div> : null),
  };
};

export default uploadDateColumn;
