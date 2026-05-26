import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NowDocumentResultItem from "@/components/noticeOfWork/applications/search/NowDocumentResultItem";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NowDocumentSearchResult } from "@mds/common/interfaces/search/facet-search.interface";

jest.mock("@mds/common/components/documents/DocumentLink", () => () => <div />);
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
    const showMoreButton = screen.getByRole("link", { name: "Show more" });
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

    fireEvent.click(screen.getByRole("link", { name: "Show more" }));
    expect(screen.getByRole("link", { name: "Show less" })).toBeInTheDocument();
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

    expect(screen.getByRole("link", { name: "Show more" })).toBeInTheDocument();
    expect(screen.queryByText("Formatted table")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Show more" }));
    expect(screen.getByText("Formatted table")).toBeInTheDocument();
  });
});
