import React from "react";
import { Table, Row, Col, Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";

/**
 * @class  DocumentResultsTable - displays a table of mine search results
 */

const propTypes = {
  header: PropTypes.string.isRequired,
  highlightRegex: PropTypes.objectOf(PropTypes.regexp).isRequired,
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
        <Row>
          <Col span={24}>
            <LinkButton
              key={record.mine_document_guid || record.permit_amendment_document_guid}
              onClick={() => downloadFileFromDocumentManager(record)}
            >
              <Highlight search={props.highlightRegex}>{record.document_name}</Highlight>
            </LinkButton>
          </Col>
        </Row>,
        <Row className="padding-small--top">
          <Col xs={24} md={6}>
            <p>Mine</p>
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
        className="nested-table padding-large--bottom"
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
