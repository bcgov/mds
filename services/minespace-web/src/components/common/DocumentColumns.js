import React from "react";
import moment from "moment";
import { formatDate, formatDateTime } from "@common/utils/helpers";
import * as Strings from "@/constants/strings";

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

export const importedByColumn = () => {
  return {
    title: "Imported By",
    dataIndex: "create_user",
    render: (text) => (text ? <div title="User">{text}</div> : null),
  };
};

export default uploadDateColumn;
