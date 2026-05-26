import React, { useMemo } from "react";
import { Col, Row, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import MarkdownViewer from "@/components/mine/Permit/Search/components/MarkdownViewer";
import { NowDocumentSearchResult } from "@mds/common/interfaces/search/facet-search.interface";
import { useAppSelector } from "@mds/common/redux/rootState";
import { selectNowSearchQuery } from "@mds/common/redux/slices/nowApplicationSearchSlice";

interface NowDocumentResultItemProps {
  result: NowDocumentSearchResult;
  onFilterClick?: (category: string, value: string) => void;
  index?: number;
}

// Scores from Azure hybrid search sit in roughly the 1–4 range.
const normalizeScore = (score: number) =>
  Math.min(Math.round(((score - 1) / 3) * 100), 100);

const formatArtifactType = (artifactType: string) =>
  artifactType
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

function highlightTerms(text: string, query: string): React.ReactNode {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="now-search__term-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const NowDocumentResultItem: React.FC<NowDocumentResultItemProps> = ({
  result,
  onFilterClick,
  index,
}) => {
  const { content, meta, score } = result;
  const {
    document_name,
    document_type,
    document_manager_guid,
    submitted_date,
    highlights,
    artifact_type,
    artifact_page_number,
    artifact_table_markdown,
    artifact_presigned_url,
  } = meta;
  const query = useAppSelector(selectNowSearchQuery);

  // Azure Search returns highlighted fragments with the matched term wrapped in **...**
  // (configured via highlight_pre_tag / highlight_post_tag on the document store).
  // Join multiple fragments with an ellipsis so the reader gets a readable snippet.
  const highlightSnippet = highlights?.content?.length
    ? highlights.content.join(" … ")
    : null;

  const isPermitPackage = document_type?.toLowerCase().includes("permit");

  const formattedDate = submitted_date ? dayjs(submitted_date).format("MMM D, YYYY") : null;

  const matchPercent = useMemo(() => normalizeScore(score), [score]);
  console.log(artifact_presigned_url)
  return (
    <Row
      id={index !== undefined ? `condition-${index + 1}` : undefined}
      className="permit-search__result-item"
      gutter={[0, 8]}
    >
      {/* Header: document name + match score */}
      <Col span={24}>
        <Row justify="space-between" align="top">
          <Col flex="auto">
            <Typography.Text strong style={{ fontSize: 14 }}>
              {document_name}
            </Typography.Text>
          </Col>
          <Col>
            <Tag color="green">{matchPercent}% match</Tag>
          </Col>
        </Row>
      </Col>

      {/* Highlighted excerpt */}
      <Col span={24} className="now-search__highlight-excerpt">
        {highlightSnippet ? (
          <MarkdownViewer markdown={highlightSnippet} />
        ) : (
          <Typography.Text type="secondary">
            {highlightTerms(
              content.length > 400 ? `${content.substring(0, 400)}…` : content,
              query
            )}
          </Typography.Text>
        )}
      </Col>

      {artifact_presigned_url && (
        <Col span={24} className="now-search__artifact-preview-image-wrap">
          <img
            src={artifact_presigned_url}
            alt={`Artifact preview for ${document_name}`}
            className="now-search__artifact-preview-image"
          />
        </Col>
      )}

      {artifact_type === "table" && artifact_table_markdown && (
        <Col span={24} className="now-search__artifact-table">
          <Typography.Text strong>Formatted table</Typography.Text>
          <MarkdownViewer markdown={artifact_table_markdown} />
        </Col>
      )}

      {/* Footer: tags left, document link + date right */}
      <Col span={24}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space wrap size={4}>
              {document_type && (
                <Tag
                  color={isPermitPackage ? "orange" : "blue"}
                  style={{ cursor: onFilterClick ? "pointer" : "default" }}
                  onClick={() => onFilterClick?.("document_type", document_type)}
                >
                  {document_type}
                </Tag>
              )}
              {artifact_type && (
                <Tag
                  color="geekblue"
                  className="permit-search__artifact-tag"
                  style={{ cursor: onFilterClick ? "pointer" : "default" }}
                  onClick={() => onFilterClick?.("artifact_type", artifact_type)}
                >
                  {formatArtifactType(artifact_type)}
                </Tag>
              )}
              {typeof artifact_page_number === "number" && (
                <Tag
                  color="cyan"
                  className="permit-search__artifact-tag"
                  style={{ cursor: onFilterClick ? "pointer" : "default" }}
                  onClick={() =>
                    onFilterClick?.("artifact_page_number", String(artifact_page_number))
                  }
                >
                  Page {artifact_page_number}
                </Tag>
              )}
              {isPermitPackage && (
                <Tag color="gold">Permit Package</Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <DocumentLink
                unstyled
                documentManagerGuid={document_manager_guid}
                documentName={document_name}
                truncateDocumentName={false}
              />
              {formattedDate && (
                <Typography.Text type="secondary" className="permit-search__document-info">
                  {formattedDate}
                </Typography.Text>
              )}
            </Space>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default NowDocumentResultItem;
