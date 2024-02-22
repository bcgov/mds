import { Divider, List, Typography } from "antd";
import React from "react";
import CoreTable from "../common/CoreTable";
import { renderDateColumn, renderTextColumn } from "../common/CoreTableCommonColumns";
import { nullableStringSorter } from "@mds/common/redux/utils/helpers";
import DocumentLink from "../documents/DocumentLink";

interface IPermitSearchResultProps {
  header: string;
  highlightRegex: RegExp;
  searchResults: any[];
}

const deduplicateOffsets = (offsets: { start: number; end: number }[]) => {
  const sortedOffsets = offsets.sort((a, b) => a.start - b.start);
  const deduplicatedOffsets = [sortedOffsets[0]];

  for (let i = 1; i < sortedOffsets.length; i++) {
    const currentOffset = sortedOffsets[i];
    const previousOffset = deduplicatedOffsets[deduplicatedOffsets.length - 1];

    if (currentOffset.start > previousOffset.end) {
      deduplicatedOffsets.push(currentOffset);
    } else if (currentOffset.end > previousOffset.end) {
      previousOffset.end = currentOffset.end;
    }
  }

  return deduplicatedOffsets;
};

const highlightText = (text: string, offsets: { start: number; end: number }[]) => {
  let highlightedText = "";
  let currentPosition = 0;

  offsets.forEach((offset) => {
    const { start, end } = offset;
    highlightedText += text.substring(currentPosition, start);
    highlightedText += `<span class="highlight">${text.substring(start, end)}</span>`;
    currentPosition = end;
  });

  highlightedText += text.substring(currentPosition);

  return highlightedText;
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

        <Typography.Paragraph title="Result">
          <span dangerouslySetInnerHTML={{ __html: text }}></span>
        </Typography.Paragraph>
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
  const data = props.searchResults.map((result) => {
    // const offsets: { start: number, end: number }[] = deduplicateOffsets(result.value.offsets_in_context || []);

    // const highlightedText = highlightText(result.value.context, offsets);

    const {
      description,
      document_name,
      issue_date,
      mine_name,
      mine_no,
      name,
      object_store_path,
      permit_no,
      permit_amendment_id,
    } = result.value.meta;

    return {
      title: result.value.meta?.highlighted?.content?.join(" ") || result.value.answer,
      content: result.value.context,
      meta: [
        { key: "Document", value: result.value.meta.document_name },
        { key: "Mine Name", value: result.value.meta.mine_name },
        { key: "Permit", value: result.value.meta.permit_no },
      ],
      table: {
        result:
          result.value.meta?.highlighted?.content?.join(" ") ||
          result.value.answer ||
          result.value.content,
        context: result.value.content,
        mine_name: mine_name,
        permit_no: permit_no,
        document_type: description,
        issue_date: issue_date,
        permit_amendment_id: "" + permit_amendment_id,
        document_name: document_name,
        document_manager_guid: object_store_path?.substring(
          object_store_path?.lastIndexOf("/") + 1
        ),
      },
    };
  });

  return (
    <>
      <div className="padding-lg--bottom">
        <h2>{props.header}</h2>
        <Divider />
        <CoreTable columns={columns} dataSource={data.map(({ table }) => table)} />
      </div>

      {/* <List
                itemLayout="vertical"
                size="large"
                pagination={{
                    onChange: (page) => {
                        console.log(page);
                    },
                    pageSize: 10,
                }}
                dataSource={data}
                renderItem={(item) => (
                    <List.Item
                        key={item.title}
                        actions={[
                        ]}
                    // extra={
                    // }
                    >
                        <List.Item.Meta />

                        <div dangerouslySetInnerHTML={{ __html: item.title }}></div>
                        {item.content}

                        {item.meta.map(({ key, value }) => <div><i>{key}</i>: {value}</div>)}
                    </List.Item>
                )}
            /> */}
    </>
  );
};

export default PermitSearchResults;
