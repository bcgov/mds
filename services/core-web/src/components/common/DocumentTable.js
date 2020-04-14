import React from "react";
import PropTypes from "prop-types";
import { Table, Popconfirm, Button } from "antd";
import { formatDate, dateSorter, nullableStringSorter } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.documentRecord),
  isViewOnly: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  removeDocument: PropTypes.func,
  tableEmptyMessage: PropTypes.string,
};

const defaultProps = {
  documents: [],
  isViewOnly: false,
  removeDocument: () => {},
  tableEmptyMessage: "There are no attached documents.",
};

export const DocumentTable = (props) => {
  const columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      sorter: nullableStringSorter("name"),
      render: (text, record) => (
        <div key={record.key} title="Name">
          <LinkButton onClick={() => downloadFileFromDocumentManager(record)}>{text}</LinkButton>
        </div>
      ),
    },
    {
      title: "Category",
      key: "category",
      dataIndex: "category",
      sorter: nullableStringSorter("category"),
      render: (text) => <div title="Category">{text}</div>,
    },
    {
      title: "Uploaded",
      key: "uploaded",
      dataIndex: "uploaded",
      sorter: dateSorter("uploaded"),
      defaultSortOrder: "descend",
      render: (text) => <div title="Uploaded">{formatDate(text)}</div>,
    },
    {
      key: "remove",
      className: props.isViewOnly ? "column-hide" : "",
      render: (text, record) => (
        <div align="right" className={props.isViewOnly ? "column-hide" : ""}>
          <Popconfirm
            placement="topLeft"
            title={`Are you sure you want to delete ${record.name}?`}
            onConfirm={(event) => props.removeDocument(event, record.key)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button ghost type="primary" size="small">
              <img src={TRASHCAN} alt="Remove" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      align="left"
      pagination={false}
      columns={columns}
      locale={{ emptyText: props.tableEmptyMessage }}
      dataSource={props.documents}
    />
  );
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
