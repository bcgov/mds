import { Divider, Typography } from "antd";
import React from "react";
import CoreTable from "../common/CoreTable";
import { renderDateColumn, renderTextColumn } from "../common/CoreTableCommonColumns";
import { nullableStringSorter } from "@mds/common/redux/utils/helpers";
import DocumentLink from "../documents/DocumentLink";

interface IPermitSearchResultMeta {
  description: string;
  document_name: string;
  issue_date: string;
  mine_name: string;
  mine_no: string;
  name: string;
  object_store_path: string;
  permit_no: string;
  permit_amendment_id: string;
  highlighted: {
    content: string[];
  };
}

interface IPermitSearchResult {
  value: {
    content: string;
    meta: IPermitSearchResultMeta;
  };
}

interface IPermitSearchResultProps {
  header: string;
  highlightRegex?: RegExp;
  searchResults?: IPermitSearchResult[];
}

/**
 * Search results are returned with highlighted sections already wrapped in <b><u> tags from the search API.
 * This function renders the highlighted text with JSX instead of having to use dangerouslySetInnerHTML for the tags to be rendered, to avoid any risk of XSS.
 *
 * @param result - The result to be highlighted.
 * @returns The highlighted result with sections wrapped in bold and underlined tags.
 */
const highlightResultSafely = (result: string) => {
  const highlightedSections = result.split("<b><u>").map((section, index) => {
    const endIndex = section.indexOf("</u></b>");
    const highlightedText = section.substring(0, endIndex);
    const remainingText = section.substring(endIndex + 8); // 8 is the length of "</u></b>"
    return (
      <span key={index}>
        <b>
          <u>{highlightedText}</u>
        </b>
        {remainingText}
      </span>
    );
  });

  return <>{highlightedSections}</>;
};

const columns = [
  {
    title: "Result",
    dataIndex: "result",
    key: "result",
    render: (text, record) => (
      <>
        <Typography.Paragraph>
          <DocumentLink
            documentManagerGuid={record?.document_manager_guid}
            documentName={record?.document_name}
            truncateDocumentName={false}
          />
        </Typography.Paragraph>

        <Typography.Paragraph title="Result">{highlightResultSafely(text)}</Typography.Paragraph>
        <Typography.Text type="secondary">{record.context}</Typography.Text>
      </>
    ),
    sorter: nullableStringSorter("document_name"),
  },
  renderTextColumn("mine_name", "Mine", true),
  renderTextColumn("permit_no", "Permit", true),
  renderTextColumn("document_type", "Document Type", true),
  renderDateColumn("issue_date", "Issue Date", true),
  renderTextColumn("permit_amendment_id", "Amendment", true),
];

const PermitSearchResults = (props: IPermitSearchResultProps) => {
  const data = props.searchResults?.map((result) => {
    const {
      description,
      document_name,
      issue_date,
      mine_name,
      object_store_path,
      permit_no,
      permit_amendment_id,
    } = result.value.meta;

    return {
      result: result.value.meta?.highlighted?.content?.join(" ") || result.value.content,
      context: result.value.content,
      mine_name: mine_name,
      permit_no: permit_no,
      document_type: description,
      issue_date: issue_date,
      permit_amendment_id: "" + permit_amendment_id,
      document_name: document_name,
      document_manager_guid: object_store_path?.substring(object_store_path?.lastIndexOf("/") + 1),
    };
  });

  return (
    <div className="padding-lg--bottom">
      <h2>{props.header}</h2>
      <Divider />
      <CoreTable columns={columns} dataSource={data} />
    </div>
  );
};

export default PermitSearchResults;
