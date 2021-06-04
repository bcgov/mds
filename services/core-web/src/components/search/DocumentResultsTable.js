import React from "react";
import { Table, Divider, Descriptions } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import DocumentLink from "@/components/common/DocumentLink";

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
            <DocumentLink
              documentManagerGuid={record.document_manager_guid}
              documentName={record.document_name}
              linkTitleOverride={
                <Highlight search={props.highlightRegex}>{record.document_name}</Highlight>
              }
            />
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
        className="nested-table padding-lg--bottom"
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
