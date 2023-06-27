import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import { documentNameColumn, removeFunctionColumn, uploadDateColumn } from "./DocumentColumns";
import { renderTextColumn } from "./CoreTableCommonColumns";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.documentRecord),
  isViewOnly: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  removeDocument: PropTypes.func,
  excludedColumnKeys: PropTypes.arrayOf(PropTypes.string),
  additionalColumnProps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      colProps: PropTypes.objectOf(PropTypes.string),
    })
  ),
  // eslint-disable-next-line react/no-unused-prop-types
  documentParent: PropTypes.string,
  documentColumns: PropTypes.arrayOf(PropTypes.object),
  defaultSortKeys: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  documents: [],
  isViewOnly: false,
  removeDocument: () => {},
  excludedColumnKeys: [],
  additionalColumnProps: [],
  documentColumns: null,
  documentParent: null,
  defaultSortKeys: ["upload_date", "dated"], // keys to sort by when page loads
};

export const DocumentTable = (props) => {
  let columns = [
    documentNameColumn(),
    renderTextColumn("category", "Category", true),
    uploadDateColumn(),
    removeFunctionColumn(
      props.removeDocument,
      props.isViewOnly || !props.removeDocument,
      "name",
      props?.documentParent
    ),
  ];

  if (props?.excludedColumnKeys?.length > 0) {
    columns = columns.filter((column) => !props.excludedColumnKeys.includes(column.key));
  }

  if (props?.additionalColumnProps?.length > 0) {
    // eslint-disable-next-line no-unused-expressions
    props?.additionalColumnProps.forEach((addColumn) => {
      const columnIndex = columns.findIndex((column) => addColumn?.key === column.key);
      if (columnIndex >= 0) {
        columns[columnIndex] = { ...columns[columnIndex], ...addColumn?.colProps };
      }
    });
  }

  if (props.defaultSortKeys.length > 0) {
    columns = columns.map((column) => {
      const isDefaultSort = props.defaultSortKeys.includes(column.key);
      return isDefaultSort ? { defaultSortOrder: "descend", ...column } : column;
    });
  }

  return <CoreTable columns={props?.documentColumns ?? columns} dataSource={props.documents} />;
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
