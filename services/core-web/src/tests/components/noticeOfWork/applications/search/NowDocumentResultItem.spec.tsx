import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NowDocumentResultItem from "@/components/noticeOfWork/applications/search/NowDocumentResultItem";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NowDocumentSearchResult } from "@mds/common/interfaces/search/facet-search.interface";

jest.mock("@mds/common/components/documents/DocumentLink", () => () => <div />);
jest.mock("@/components/mine/Permit/Search/components/MarkdownViewer", () => () => <div />);

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
});
