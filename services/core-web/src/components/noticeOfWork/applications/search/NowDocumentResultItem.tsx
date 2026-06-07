import React, { useMemo, useState } from "react";
import { Col, Row, Space, Tag, Typography } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import MarkdownViewer from "@/components/mine/Permit/Search/components/MarkdownViewer";
import ArtifactImagePreview from "@/components/common/ArtifactImagePreview";
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

const displayFormat = (text: string) =>
  text
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
    artifact_category,
    artifact_page_number,
    artifact_bounding_box_left,
    artifact_bounding_box_top,
    artifact_bounding_box_right,
    artifact_bounding_box_bottom,
    artifact_table_markdown,
    artifact_presigned_url,
    artifact_caption,
    artifact_summary,
    caption_source,
    summary_source,
  } = meta;
  const query = useAppSelector(selectNowSearchQuery);

  // Azure Search returns highlighted fragments with the matched term wrapped in **...**
  // (configured via highlight_pre_tag / highlight_post_tag on the document store).
  // Join multiple fragments with an ellipsis so the reader gets a readable snippet.
  const highlightSnippet = highlights?.content?.length
    ? highlights.content.join(" … ")
    : null;

  const isPermitPackage = document_type?.toLowerCase().includes("permit");
  const hasArtifactImage = Boolean(artifact_presigned_url);
  const hasFormattedTable = artifact_type === "table" && Boolean(artifact_table_markdown);
  const hasArtifactContent = hasArtifactImage || hasFormattedTable;
  const hasArtifactSummary = Boolean(artifact_summary);
  const hasArtifactCaption = Boolean(artifact_caption);

  const formattedDate = submitted_date ? dayjs(submitted_date).format("MMM D, YYYY") : null;
  const hasBoundingBox = artifact_bounding_box_left && artifact_bounding_box_top && artifact_bounding_box_right && artifact_bounding_box_bottom;
  const pageNumber = artifact_page_number || artifact_page_number === 0 ? artifact_page_number : 0;
  const documentViewerLocation =
    hasBoundingBox
      ? {
        pageNumber: pageNumber,
        boundingBox: hasBoundingBox
          ? {
            left: artifact_bounding_box_left,
            top: artifact_bounding_box_top,
            right: artifact_bounding_box_right,
            bottom: artifact_bounding_box_bottom,
          }
          : undefined,
      }
      : null;

  const matchPercent = useMemo(() => normalizeScore(score), [score]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

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

      {hasArtifactImage && (
        <Col span={24} className="now-search__artifact-preview-image-wrap">
          <ArtifactImagePreview
            src={artifact_presigned_url}
            alt={`Artifact preview for ${document_name}`}
            imageClassName="now-search__artifact-preview-image"
            wrapperClassName="now-search__artifact-preview-card"
          />
        </Col>
      )}

      {hasFormattedTable && (
        <Col span={24} className="now-search__artifact-table">
          <div className="now-search__artifact-table-controls now-search__artifact-table-controls--top">
            <Typography.Link
              href="#"
              className="margin-none"
              onClick={(event) => {
                event.preventDefault();
                setIsTableExpanded((expanded) => !expanded);
              }}
            >
              <span>{isTableExpanded ? "Show less " : "Show more "}</span>
              {isTableExpanded ? <UpOutlined /> : <DownOutlined />}
            </Typography.Link>
          </div>
          {isTableExpanded && (
            <>
              <Typography.Text strong className="now-search__artifact-table-title">
                Formatted table
              </Typography.Text>
              <div className="now-search__artifact-table-content">
                <MarkdownViewer markdown={artifact_table_markdown as string} />
              </div>
            </>
          )}
        </Col>
      )}

      {(hasArtifactSummary || hasArtifactCaption) && (
        <Col span={24} className="now-search__artifact-insights">
          {hasArtifactSummary && (
            <Typography.Paragraph className="now-search__artifact-summary" ellipsis={{ rows: 4 }}>
              {artifact_summary}
              {summary_source && (
                <Typography.Text type="secondary" className="now-search__artifact-source">
                  {` (${summary_source})`}
                </Typography.Text>
              )}
            </Typography.Paragraph>
          )}
          {hasArtifactCaption && (
            <Typography.Text type="secondary" className="now-search__artifact-caption">
              <strong>Caption:</strong> {artifact_caption}
              {caption_source && (
                <span className="now-search__artifact-source"> {`(${caption_source})`}</span>
              )}
            </Typography.Text>
          )}
        </Col>
      )}

      {/* Only show OCR/highlight text when there is no artifact content. */}
      {!hasArtifactContent && !hasArtifactSummary && (
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
                  {displayFormat(artifact_type)}
                </Tag>
              )}
              {artifact_category && (
                <Tag
                  color="purple"
                  className="permit-search__artifact-tag"
                  style={{ cursor: onFilterClick ? "pointer" : "default" }}
                  onClick={() => onFilterClick?.("artifact_category", artifact_category)}
                >
                  {displayFormat(artifact_category)}
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
                documentViewerLocation={documentViewerLocation}
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
