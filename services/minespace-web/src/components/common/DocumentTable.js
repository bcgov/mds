import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Icon, Popconfirm, Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
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
      name: document.document_name,
      category: document.variance_document_category_code
        ? this.props.documentCategoryOptionsHash[document.variance_document_category_code]
        : Strings.EMPTY_FIELD,
      created_at: formatDate(document.created_at) || Strings.EMPTY_FIELD,
    }));

  render() {
    // {
    //   console.log(this.props.documents);
    // }

    const columns = [
      {
        title: "File name",
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
        title: "Upload date",
        dataIndex: "created_at",
        render: (text) => <div title="Upload date">{text}</div>,
      },
      {
        title: "",
        dataIndex: "updateEdit",
        width: 10,
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
              <Button ghost type="primary" size="small">
                <Icon type="minus-circle" theme="outlined" />
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
        locale={{ emptyText: "This variance does not contain any documents" }}
        dataSource={this.transformRowData(this.props.documents)}
      />
    );
  }
}

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
