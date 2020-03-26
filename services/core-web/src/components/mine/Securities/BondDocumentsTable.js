import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Table, Popconfirm, Button } from "antd";
import { formatDate, dateSorter } from "@common/utils/helpers";
import { getBondDocumentTypeOptionsHash } from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  bondDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  removeDocument: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

const defaultProps = {
  documents: [],
  removeDocument: () => {},
  isViewOnly: false,
};

export const BondDocumentsTable = (props) => {
  const transformRowData = (documents) =>
    documents.map((document) => ({
      key: document.mine_document_guid,
      document_manager_guid: document.document_manager_guid,
      name: document.document_name,
      category: document.bond_document_type_code
        ? props.bondDocumentTypeOptionsHash[document.bond_document_type_code]
        : Strings.EMPTY_FIELD,
      upload_date: formatDate(document.upload_date) || Strings.EMPTY_FIELD,
    }));

  const columns = [
    {
      title: "File Name",
      key: "name",
      dataIndex: "name",
      render: (text, record) => (
        <div title="File Name">
          <LinkButton key={record.key} onClick={() => downloadFileFromDocumentManager(record)}>
            {text}
          </LinkButton>
        </div>
      ),
    },
    {
      title: "Category",
      key: "category",
      dataIndex: "category",
      render: (text) => <div title="Category">{text}</div>,
    },
    {
      title: "Upload Date",
      key: "upload_date",
      dataIndex: "upload_date",
      sorter: dateSorter("upload_date"),
      defaultSortOrder: "descend",
      render: (text) => <div title="Upload Date">{text}</div>,
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
              <img name="remove" src={TRASHCAN} alt="Remove Activity" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        locale={{ emptyText: "This bond does not contain any documents." }}
        dataSource={transformRowData(props.documents)}
      />
    </div>
  );
};

BondDocumentsTable.propTypes = propTypes;
BondDocumentsTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  bondDocumentTypeOptionsHash: getBondDocumentTypeOptionsHash(state),
});

export default connect(mapStateToProps)(BondDocumentsTable);
