import React from "react";
import { Divider } from "antd";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@/components/common/CoreTable";
import { renderDateColumn, renderTextColumn } from "../common/CoreTableCommonColumns";
import { nullableStringSorter } from "@common/utils/helpers";

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
      title: "File Name",
      dataIndex: "document_name",
      key: "document_name",
      render: (text, record) => (
        <div key={record.document_manager_guid} title="File Name">
          <DocumentLink
            documentManagerGuid={record.document_manager_guid}
            documentName={text}
            truncateDocumentName={false}
            linkTitleOverride={<Highlight search={props.highlightRegex}>{text}</Highlight>}
          />
        </div>
      ),
      sorter: nullableStringSorter("document_name"),
    },
    renderTextColumn("mine_name", "Mine", true),
    renderDateColumn("upload_date", "Uploaded", true),
    renderTextColumn("create_user", "Uploaded By", true),
  ];

  return (
    <div className="padding-lg--bottom">
      <h2>{props.header}</h2>
      <Divider />
      <CoreTable columns={columns} dataSource={props.searchResults} />
    </div>
  );
};

DocumentResultsTable.propTypes = propTypes;
DocumentResultsTable.defaultProps = defaultProps;

export default DocumentResultsTable;
