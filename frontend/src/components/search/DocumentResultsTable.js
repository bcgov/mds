import React from "react";
import { Table, Row, Col, Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";

/**
 * @class  DocumentResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  highlightRegex: PropTypes.objectOf(PropTypes.any).isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {};

export const DocumentResultsTable = (props) => {
  const columns = [
    {
      title: "Document Guid",
      dataIndex: "document_guid",
      key: "document_guid",
      render: (text, record) => [
        <Row style={{ paddingBottom: "15px" }}>
          <Col span={24}>
            <a
              role="link"
              key={record.mine_document_guid || record.permit_amendment_document_guid}
              onClick={() =>
                downloadFileFromDocumentManager(record.document_manager_guid, record.document_name)
              }
              // Accessibility: Event listener
              onKeyPress={() =>
                downloadFileFromDocumentManager(record.document_manager_guid, record.document_name)
              }
              // Accessibility: Focusable element
              tabIndex="0"
            >
              <p style={{ fontSize: "22px", color: "inherit" }}>
                <Highlight search={props.highlightRegex}>{record.document_name}</Highlight>
              </p>
            </a>
          </Col>
        </Row>,
        <Row style={{ paddingTop: "5px" }}>
          <Col xs={24} md={6}>
            <p>Mine:</p>
          </Col>
          <Col xs={24} md={18}>
            <p>{record.mine_name}</p>
          </Col>
        </Row>,
      ],
    },
  ];
  return (
    <div>
      <h2>{props.header}</h2>
      <Divider />
      <Table
        className="nested-table"
        align="left"
        showHeader={false}
        pagination={false}
        columns={columns}
        dataSource={props.searchResults}
      />
    </div>
  );
};

DocumentResultsTable.propTypes = propTypes;
DocumentResultsTable.defaultProps = defaultProps;

export default DocumentResultsTable;
