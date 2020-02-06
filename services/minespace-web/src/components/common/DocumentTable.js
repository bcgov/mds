import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Icon, Popconfirm, Button } from "antd";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import * as Strings from "@/constants/strings";

const propTypes = {
  isViewOnly: PropTypes.bool.isRequired,
  noDataMessage: PropTypes.string.isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  removeDocument: PropTypes.func,
};

const defaultProps = {
  documents: [],
  removeDocument: () => {},
};

export class DocumentTable extends Component {
  transformRowData = (documents) =>
    documents.map((document) => ({
      key: document.mine_document_guid,
      name: document.document_name,
      category: document.variance_document_category_code
        ? this.props.documentCategoryOptionsHash[document.variance_document_category_code]
        : Strings.EMPTY_FIELD,
      created_at: formatDate(document.created_at) || Strings.EMPTY_FIELD,
    }));

  render() {
    const columns = [
      {
        title: "File Name",
        dataIndex: "name",
        render: (text, record) => (
          <div title="File name">
            <div>
              <a
                role="link"
                onClick={() => downloadFileFromDocumentManager(record.key, text)}
                // Accessibility: Event listener
                onKeyPress={() => downloadFileFromDocumentManager(record.key, text)}
                // Accessibility: Focusable element
                tabIndex="0"
              >
                {text}
              </a>
            </div>
          </div>
        ),
      },
      {
        title: "Category",
        dataIndex: "category",
        render: (text) => <div title="Category">{text}</div>,
      },
      {
        title: "Upload Date",
        dataIndex: "created_at",
        render: (text) => <div title="Upload date">{text}</div>,
      },
      {
        title: "",
        dataIndex: "updateEdit",
        className: this.props.isViewOnly ? "column-hide" : "",
        render: (text, record) => (
          <div title="" align="right">
            <Popconfirm
              placement="topRight"
              title={`Are you sure you want to remove ${record.name} from this application?`}
              onConfirm={(event) => this.props.removeDocument(event, record.key)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button type="link">
                <Icon type="minus-circle" theme="outlined" />
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <Table
        size="small"
        tableLayout="auto"
        pagination={false}
        columns={columns}
        locale={{ emptyText: this.props.noDataMessage }}
        dataSource={this.transformRowData(this.props.documents)}
      />
    );
  }
}

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
