import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Popconfirm, Button } from "antd";
import { formatDate } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.genericMineDocumentData),
  removeDocument: PropTypes.func,
  isViewOnly: PropTypes.bool.isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  documents: [],
  removeDocument: () => {},
};

export class DocumentTable extends Component {
  transformRowData = (documents) =>
    documents.map((document) => ({
      key: document.mine_document_guid,
      document_manager_guid: document.document_manager_guid,
      name: document.document_name,
      category: document.variance_document_category_code
        ? this.props.documentCategoryOptionsHash[document.variance_document_category_code]
        : Strings.EMPTY_FIELD,
      created_at: formatDate(document.created_at) || Strings.EMPTY_FIELD,
    }));

  render() {
    const columns = [
      {
        title: "File name",
        dataIndex: "name",
        render: (text, record) => (
          <div title="File name">
            <LinkButton key={record.key} onClick={() => downloadFileFromDocumentManager(record)}>
              {text}
            </LinkButton>
          </div>
        ),
      },
      {
        title: "Category",
        dataIndex: "category",
        render: (text) => <div title="Upload date">{text}</div>,
      },
      {
        title: "Upload date",
        dataIndex: "created_at",
        render: (text) => <div title="Upload date">{text}</div>,
      },
      {
        title: "",
        dataIndex: "",
        className: this.props.isViewOnly ? "column-hide" : "",
        render: (text, record) => (
          <div title="" align="right" className={this.props.isViewOnly ? "column-hide" : ""}>
            <Popconfirm
              placement="topLeft"
              title={`Are you sure you want to delete ${record.name}?`}
              onConfirm={(event) => this.props.removeDocument(event, record.key)}
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
          locale={{ emptyText: "No documents have been uploaded." }}
          dataSource={this.transformRowData(this.props.documents)}
        />
      </div>
    );
  }
}

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
