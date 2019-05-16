import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Icon, Popconfirm, Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  removeDocument: PropTypes.func,
  associatedGuid: PropTypes.string,
};

const defaultProps = {
  documents: [],
  removeDocument: () => {},
  associatedGuid: "",
};

export class DocumentTable extends Component {
  state = { documents: [] };

  componentDidMount() {
    this.setState({ documents: this.props.documents });
  }

  componentWillReceiveProps(nextProps) {
    const documentsChanged = nextProps.documents !== this.props.documents;
    if (documentsChanged) {
      console.log("IM HERE");
      this.setState({ documents: nextProps.documents });
    }
  }

  transformRowData = (documents) =>
    documents.map((document) => ({
      key: document.mine_document_guid,
      name: document.document_name,
      created_at: formatDate(document.created_at) || String.EMPTY_FIELD,
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
        title: "Upload date",
        dataIndex: "created_at",
        render: (text) => <div title="Upload date">{text}</div>,
      },
      {
        title: "",
        dataIndex: "updateEdit",
        width: 10,
        className: !this.props.associatedGuid ? "column-hide" : "",
        render: (text, record) => (
          <div title="" align="right">
            <Popconfirm
              placement="topLeft"
              title={`Are you sure you want to delete ${record.name}?`}
              onConfirm={(event) =>
                this.props.removeDocument(event, this.props.associatedGuid, record.key)
              }
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
      <div>
        <Table
          align="left"
          pagination={false}
          columns={columns}
          locale={{ emptyText: "This variance does not contain any documents" }}
          dataSource={this.transformRowData(this.state.documents)}
        />
      </div>
    );
  }
}

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
