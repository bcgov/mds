import React from "react";
import { render } from "@testing-library/react";
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
    document_name: "Test_Document.pdf",
    document_type: "Technical Report",
    document_manager_guid: "doc-guid-123",
    submitted_date: "2024-05-01T12:00:00Z",
    mine_guid: "mine-guid-456",
    highlights: {
      content: ["This is a **test snippet** of document content"]
    }
  }
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
});
