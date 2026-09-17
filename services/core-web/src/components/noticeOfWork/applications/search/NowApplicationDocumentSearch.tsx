import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Layout,
  Popconfirm,
  Progress,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  cancelNowIndexing,
  clearNowSearch,
  fetchNowIndexingStatus,
  indexNowApplicationDocuments,
  NowIndexerStatus,
  searchNowApplicationDocuments,
  selectNowAiLoading,
  selectNowAllFacets,
  selectNowCancelling,
  selectNowDocumentLoading,
  selectNowIndexerStatus,
  selectNowIndexing,
  selectNowSearchFilters,
  selectNowSearchLoading,
  selectNowSearchQuery,
  selectNowSearchResults,
} from "@mds/common/redux/slices/nowApplicationSearchSlice";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompress, faExpand } from "@fortawesome/pro-solid-svg-icons";

// Reuse the existing search UI sub-components from Permit Search — they are
// generic enough to work for any document search backed by the same SSE contract.
import SearchBox from "@/components/mine/Permit/Search/components/SearchBox";
import SearchResults, {
  SelectedFilter,
} from "@/components/mine/Permit/Search/components/SearchResults";
import MarkdownViewer from "@/components/mine/Permit/Search/components/MarkdownViewer";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import NowApplicationDocumentSearchSplashScreen from "./NowApplicationDocumentSearchSplashScreen";
import NowDocumentResultItem from "./NowDocumentResultItem";
import { NowDocumentSearchResult } from "@mds/common/interfaces/search/facet-search.interface";
import CoreButton from "@mds/common/components/common/CoreButton";

interface NowApplicationDocumentSearchProps {
  nowApplicationGuid: string;
}

/**
 * Document search UI for a Notice of Work application.
 *
 * Structurally mirrors PermitConditionSearch but is scoped to a single NoW application:
 *   - Uses the nowApplicationSearch Redux slice (separate state namespace)
 *   - Passes nowApplicationGuid to every search thunk dispatch
 *   - Reuses all existing Permit Search sub-components (SearchBox, SearchResults,
 *     FilterDrawer, ResultItem, MarkdownViewer) — they are UI-agnostic
 *
 * The isolation guarantee lives in the backend. This component never passes
 * nowApplicationGuid as a filter to the query body — it goes in the URL path only.
 */
// Poll frequently while indexing is in progress so the progress bar moves smoothly.
const STATUS_POLL_INTERVAL_ACTIVE_MS = 2_000;

function IndexerStatusBadge({ status }: { status: NowIndexerStatus | null }) {
  if (!status) return null;

  const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    never_run: { color: "default", icon: <ClockCircleOutlined />, label: "Never indexed" },
    running: { color: "processing", icon: <SyncOutlined spin />, label: "Indexing…" },
    success: { color: "success", icon: <CheckCircleOutlined />, label: "Indexed" },
    error: { color: "error", icon: <CloseCircleOutlined />, label: "Index error" },
    transientFailure: { color: "warning", icon: <CloseCircleOutlined />, label: "Index warning" },
    cancelled: { color: "default", icon: <CloseCircleOutlined />, label: "Index cancelled" },
  };

  const cfg = configs[status.status] ?? configs.never_run;

  return (
    <Space size="small" align="center">
      <Tag icon={cfg.icon} color={cfg.color}>
        {cfg.label}
      </Tag>
      {status.status === "running" && (
        <Progress
          percent={status.percent ?? 0}
          size="small"
          style={{ width: 140, marginBottom: 0 }}
          format={(pct) => `${pct}%`}
        />
      )}
      {status.error_message && (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          {status.error_message}
        </Typography.Text>
      )}
    </Space>
  );
}

function LastIndexedLabel({ status }: { status: NowIndexerStatus | null }) {
  if (!status || status.status === "running" || !status.last_run_end) return null;

  const lastRun = new Date(status.last_run_end).toLocaleString();
  const documentCount = status.document_count ?? 0;

  return (
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      Last indexed: {lastRun}
      {documentCount > 0 && ` · ${documentCount.toLocaleString()} document${documentCount === 1 ? "" : "s"}`}
    </Typography.Text>
  );
}

const NowApplicationDocumentSearch: React.FC<NowApplicationDocumentSearchProps> = ({
  nowApplicationGuid,
}) => {
  const dispatch = useAppDispatch();
  const results = useAppSelector(selectNowSearchResults);
  const loading = useAppSelector(selectNowSearchLoading);
  const aiLoading = useAppSelector(selectNowAiLoading);
  const indexing = useAppSelector(selectNowIndexing);
  const indexerStatus = useAppSelector(selectNowIndexerStatus);
  const cancelling = useAppSelector(selectNowCancelling);
  const query = useAppSelector(selectNowSearchQuery);
  const selectedFilters = useAppSelector(selectNowSearchFilters);
  const [isAIResponseExpanded, setIsAIResponseExpanded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshStatus = () => dispatch(fetchNowIndexingStatus(nowApplicationGuid));
  const isRunning = indexerStatus?.status === "running";
  const isIndexed = indexerStatus?.status && indexerStatus?.status !== "never_run";

  useEffect(() => {
    dispatch(clearNowSearch(nowApplicationGuid));
  }, [nowApplicationGuid]);

  // Fetch status on mount and whenever indexing is triggered.
  useEffect(() => {
    refreshStatus();
  }, [nowApplicationGuid, indexing]);

  // Auto-poll only while the indexer is actually running, so progress bar
  // movement is visible. Once it settles into a terminal status, stop —
  // there's nothing left that will change until the user triggers another run.
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (indexerStatus?.status === "running") {
      pollRef.current = setInterval(refreshStatus, STATUS_POLL_INTERVAL_ACTIVE_MS);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [indexerStatus?.status]);

  const indexButton = (
    <Button
      icon={<SyncOutlined spin={indexing} />}
      className="margin-none"
      loading={indexing}
      onClick={() => {
        if (!isIndexed) {
          dispatch(indexNowApplicationDocuments(nowApplicationGuid));
        }
      }}
    >
      {isIndexed ? "Re-Index Documents" : "Index Documents"}
    </Button>
  );

  const indexActions = (
    <Space direction="vertical" align="end" size="small">
      <Space align="center">
        <IndexerStatusBadge status={indexerStatus} />
        {isRunning ? (
          <Popconfirm
            title="Cancel indexing? This will stop the current indexing job. You can re-index at any time."
            okText="Cancel indexing"
            okButtonProps={{ danger: true }}
            cancelText="Keep running"
            onConfirm={() => dispatch(cancelNowIndexing(nowApplicationGuid))}
          >
            <Tooltip title="Cancel Indexing">
              <CoreButton
                aria-label="Cancel"
                loading={cancelling}
                className={"form-btn margin-none"}
                type={"primary"}
                danger
              >
                Cancel
              </CoreButton>
            </Tooltip>
          </Popconfirm>
        ) : (
          <Space size="middle">
            {isIndexed ? (
              <Popconfirm
                title="Re-index documents? This will re-scan all application documents. It is only necessary if new documents have been added since the last time this was run."
                onConfirm={() => dispatch(indexNowApplicationDocuments(nowApplicationGuid))}
                okText="Re-index"
                cancelText="Cancel"
              >
                {indexButton}
              </Popconfirm>
            ) : (
              indexButton
            )}
            <CoreTooltip
              icon="question"
              title="This process downloads and analyzes all application documents to make their content searchable by the AI. This is only necessary if new documents have been added since the last index."
            />
          </Space>
        )}
      </Space>
      <LastIndexedLabel status={indexerStatus} />
    </Space>
  );

  const hasActiveSearch = query || selectedFilters?.length > 0;
  const shouldShowSplash = !hasActiveSearch && !loading;

  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string, filters: SelectedFilter[]) => {
        dispatch(
          searchNowApplicationDocuments({
            nowApplicationGuid,
            query: searchQuery,
            filters,
          })
        );
      }, 300),
    [nowApplicationGuid]
  );


  return (
    <Layout className="permit-search__layout">
      <Layout.Content className="permit-search__content">
        {shouldShowSplash ? (
          <>
            <Row justify="end" style={{ marginBottom: 8 }}>
              {indexActions}
            </Row>
            <NowApplicationDocumentSearchSplashScreen
              onSearch={(q) => debouncedSearch(q, selectedFilters)}
              loading={loading}
            />
          </>
        ) : (
          <Row gutter={[16, 24]} style={{ width: "100%" }}>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Typography.Title level={1} style={{ marginBottom: 0 }}>
                    Application Document Search
                  </Typography.Title>
                </Col>
                <Col>{indexActions}</Col>
              </Row>
            </Col>
            <Col span={24}>
              <SearchBox onSearch={(q) => debouncedSearch(q, selectedFilters)} loading={loading} />
            </Col>
            <Col span={24}>
              <Row className="permit-search__results-container" gutter={[16, 0]}>
                <Col xs={24} lg={isAIResponseExpanded ? 8 : 16}>
                  <SearchResults
                    onFilterChange={(filters) => debouncedSearch(query, filters)}
                    renderItem={(result, onFilterClick, index) => (
                      <NowDocumentResultItem
                        result={result as unknown as NowDocumentSearchResult}
                        onFilterClick={onFilterClick}
                        index={index}
                      />
                    )}
                    selectors={{
                      selectResults: selectNowSearchResults,
                      selectFilters: selectNowSearchFilters,
                      selectQuery: selectNowSearchQuery,
                      selectDocumentLoading: selectNowDocumentLoading,
                      selectAllFacets: selectNowAllFacets,
                    }}
                  />
                </Col>
                <Col xs={24} lg={isAIResponseExpanded ? 16 : 8}>
                  <Card
                    title="AI-Generated Response"
                    loading={false}
                    className={`permit-search__ai-response ${isAIResponseExpanded ? "permit-search__ai-response--expanded" : ""
                      }`}
                  >
                    <FontAwesomeIcon
                      icon={isAIResponseExpanded ? faCompress : faExpand}
                      onClick={() => setIsAIResponseExpanded(!isAIResponseExpanded)}
                      className="expand-button"
                      titleId="expand-button"
                      title={isAIResponseExpanded ? "Compress" : "Expand"}
                    />
                    {aiLoading ? (
                      <Skeleton active paragraph={{ rows: 3 }} />
                    ) : (
                      results?.prompt?.answers?.map((answer) => (
                        <MarkdownViewer
                          key={`prompt-${answer.substring(0, 20)}`}
                          markdown={answer}
                        />
                      ))
                    )}
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Layout.Content>
    </Layout>
  );
};

export default NowApplicationDocumentSearch;
