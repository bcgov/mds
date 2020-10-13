import React from "react";
import { Table, Divider, Descriptions } from "antd";
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
        <Descriptions
          title={
            <LinkButton
              key={record.mine_document_guid || record.permit_amendment_document_guid}
              onClick={() => downloadFileFromDocumentManager(record)}
            >
              <Highlight search={props.highlightRegex}>{record.document_name}</Highlight>
            </LinkButton>
          }
        >
          <Descriptions.Item label="Mine">{record.mine_name}</Descriptions.Item>
        </Descriptions>,
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
