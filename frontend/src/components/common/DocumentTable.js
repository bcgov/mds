import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
};

const defaultProps = {
  documents: [],
};

export class DocumentTable extends Component {
  transformRowData = (documents) =>
    documents.map((document) => ({
      key: document.mine_document_guid,
      name: document.document_name,
      uploadedBy: document.document_name,
      upload_date: formatDate(document.received_date) || String.EMPTY_FIELD,
    }));

  render() {
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
        title: "Uploaded by",
        dataIndex: "uploadedBy",
        render: (text) => <div title="Uploaded by">{text}</div>,
      },
      {
        title: "Upload date",
        dataIndex: "upload_date",
        render: (text) => <div title="Upload date">{text}</div>,
      },
    ];

    return (
      <div>
        <Table
          align="left"
          pagination={false}
          columns={columns}
          locale={{ emptyText: "This variance does not contain any documents" }}
          dataSource={this.transformRowData(this.props.documents)}
        />
      </div>
    );
  }
}

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
