import React from "react";
import { Table, Typography } from "antd";
import { Link } from "react-router-dom";

const { Text } = Typography;

export const GenericResultsTable = ({ header, searchResults, columns, getRecordKey, highlightRegex }) => {
  const highlightText = (text) => {
    if (!text || !highlightRegex) return text;
    const parts = String(text).split(highlightRegex);
    return parts.map((part, index) =>
      highlightRegex.test(part) ? <mark key={`highlight-${index}`}>{part}</mark> : part
    );
  };

  const enhancedColumns = columns.map((col) => ({
    ...col,
    render: col.customRender || ((text, record) => {
      if (col.link) {
        return <Link to={col.link(record)}>{highlightText(text)}</Link>;
      }
      if (col.highlight !== false) {
        return highlightText(text);
      }
      return text;
    }),
  }));

  return (
    <>
      {header && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            {header}
          </Text>
        </div>
      )}
      <Table
        columns={enhancedColumns}
        dataSource={searchResults}
        rowKey={getRecordKey}
        pagination={false}
        locale={{ emptyText: "No results found" }}
      />
    </>
  );
};
