import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NowDocumentResultItem from "@/components/noticeOfWork/applications/search/NowDocumentResultItem";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NowDocumentSearchResult } from "@mds/common/interfaces/search/facet-search.interface";

const mockDocumentLink = jest.fn((props: any) => <div {...props} />);
jest.mock("@mds/common/components/documents/DocumentLink", () => (props) => mockDocumentLink(props));
jest.mock("@/components/mine/Permit/Search/components/MarkdownViewer", () => () => <div />);

const LARGE_TABLE_MARKDOWN = [
  "| A | B |",
  "| - | - |",
  "| 1 | 2 |",
  "| 3 | 4 |",
  "| 5 | 6 |",
  "| 7 | 8 |",
  "| 9 | 10 |",
  "| 11 | 12 |",
  "| 13 | 14 |",
  "| 15 | 16 |",
  "| 17 | 18 |",
  "| 19 | 20 |",
].join("\n");

const mockResult: NowDocumentSearchResult = {
  id: "test-id",
  content: "This is a test snippet of document content that should show up in the result item.",
  score: 3.5,
  meta: {
    now_application_guid: "app-guid-123",
    document_name: "Test_Document.pdf",
    document_type: "Technical Report",
    document_manager_guid: "doc-guid-123",
    submitted_date: "2024-05-01T12:00:00Z",
    mine_guid: "mine-guid-456",
    highlights: {
      content: ["This is a **test snippet** of document content"],
    },
  },
};

describe("NowDocumentResultItem", () => {
  beforeEach(() => {
    mockDocumentLink.mockClear();
  });

  it("renders properly with highlights", () => {
    const { container } = render(
      <ReduxWrapper>
        <NowDocumentResultItem result={mockResult} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders properly without highlights", () => {
    const resultWithoutHighlights = {
      ...mockResult,
      meta: { ...mockResult.meta, highlights: null }
    };
    const { container } = render(
      <ReduxWrapper>
        <NowDocumentResultItem result={resultWithoutHighlights} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders with permit package styling", () => {
    const permitResult = {
      ...mockResult,
      meta: { ...mockResult.meta, document_type: "Permit Package" }
    };
    const { container } = render(
      <ReduxWrapper>
        <NowDocumentResultItem result={permitResult} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders artifact chips when artifact metadata is present", () => {
    const artifactResult = {
      ...mockResult,
      meta: {
        ...mockResult.meta,
        artifact_type: "table",
        artifact_page_number: 4,
      },
    };

    render(
      <ReduxWrapper>
        <NowDocumentResultItem result={artifactResult} />
      </ReduxWrapper>
    );

    expect(screen.getByText("Table")).toBeInTheDocument();
    expect(screen.getByText("Page 4")).toBeInTheDocument();
  });

  it("invokes onFilterClick for artifact chips", () => {
    const onFilterClick = jest.fn();
    const artifactResult = {
      ...mockResult,
      meta: {
        ...mockResult.meta,
        artifact_type: "figure",
        artifact_page_number: 7,
      },
    };

    render(
      <ReduxWrapper>
        <NowDocumentResultItem result={artifactResult} onFilterClick={onFilterClick} />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByText("Figure"));
    fireEvent.click(screen.getByText("Page 7"));

    expect(onFilterClick).toHaveBeenCalledWith("artifact_type", "figure");
    expect(onFilterClick).toHaveBeenCalledWith("artifact_page_number", "7");
  });

  it("shows artifact-first content and hides raw text by default when artifact exists", () => {
    const artifactResult = {
      ...mockResult,
      meta: {
        ...mockResult.meta,
        highlights: null,
        artifact_type: "table",
        artifact_page_number: 4,
        artifact_table_markdown: LARGE_TABLE_MARKDOWN,
        artifact_presigned_url: "https://example.com/artifact.png",
      },
    };

    render(
      <ReduxWrapper>
        <NowDocumentResultItem result={artifactResult} />
      </ReduxWrapper>
    );

    const image = screen.getByAltText("Artifact preview for Test_Document.pdf");
    const showMoreButton = screen.getByRole("link", { name: /show more/i });
    expect(image.compareDocumentPosition(showMoreButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText(/This is a test snippet of document content/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show raw text" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View formatted table" })).not.toBeInTheDocument();
  });

  it("toggles table expansion controls", () => {
    const artifactResult = {
      ...mockResult,
      meta: {
        ...mockResult.meta,
        highlights: null,
        artifact_type: "table",
        artifact_table_markdown: LARGE_TABLE_MARKDOWN,
        artifact_presigned_url: "https://example.com/artifact.png",
      },
    };

    render(
      <ReduxWrapper>
        <NowDocumentResultItem result={artifactResult} />
      </ReduxWrapper>
    );

    expect(screen.queryByText("Formatted table")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /show more/i }));
    expect(screen.getByRole("link", { name: /show less/i })).toBeInTheDocument();
    expect(screen.getByText("Formatted table")).toBeInTheDocument();
  });

  it("shows expansion controls for short tables as well", () => {
    const artifactResult = {
      ...mockResult,
      meta: {
        ...mockResult.meta,
        artifact_type: "table",
        artifact_table_markdown: "| A | B |\n| - | - |\n| 1 | 2 |",
      },
    };

    render(
      <ReduxWrapper>
        <NowDocumentResultItem result={artifactResult} />
      </ReduxWrapper>
    );

    expect(screen.getByRole("link", { name: /show more/i })).toBeInTheDocument();
    expect(screen.queryByText("Formatted table")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /show more/i }));
    expect(screen.getByText("Formatted table")).toBeInTheDocument();
  });

  it("renders artifact summary and caption when present", () => {
    const artifactResult = {
      ...mockResult,
      meta: {
        ...mockResult.meta,
        highlights: null,
        artifact_type: "figure",
        artifact_summary: "Generated summary for this figure.",
        artifact_caption: "Generated caption",
        summary_source: "generated" as const,
        caption_source: "generated" as const,
      },
    };

    render(
      <ReduxWrapper>
        <NowDocumentResultItem result={artifactResult} />
      </ReduxWrapper>
    );

    expect(screen.getByText(/Caption:/i)).toBeInTheDocument();
    expect(screen.getByText(/Generated caption/)).toBeInTheDocument();
  });

  it("forwards document viewer location with page and bounding box", () => {
    const artifactResult = {
      ...mockResult,
      meta: {
        ...mockResult.meta,
        artifact_type: "figure",
        artifact_page_number: 9,
        artifact_bounding_box_left: 1.2,
        artifact_bounding_box_top: 2.3,
        artifact_bounding_box_right: 4.5,
        artifact_bounding_box_bottom: 6.7,
      },
    };

    render(
      <ReduxWrapper>
        <NowDocumentResultItem result={artifactResult} />
      </ReduxWrapper>
    );

    expect(mockDocumentLink).toHaveBeenCalled();
    const lastCall = mockDocumentLink.mock.calls[mockDocumentLink.mock.calls.length - 1];
    expect(lastCall).toBeDefined();
    const [lastCallProps] = lastCall as [any];
    expect(lastCallProps.documentViewerLocation).toEqual({
      pageNumber: 9,
      boundingBox: {
        left: 1.2,
        top: 2.3,
        right: 4.5,
        bottom: 6.7,
      },
    });
  });
});
