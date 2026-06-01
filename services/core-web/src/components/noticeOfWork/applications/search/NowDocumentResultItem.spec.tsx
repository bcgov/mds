import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NowDocumentResultItem from "./NowDocumentResultItem";

jest.mock("@mds/common/redux/rootState", () => ({
    useAppSelector: jest.fn(() => ""),
}));

jest.mock("@mds/common/components/documents/DocumentLink", () => () => (
    <div data-testid="document-link">DocumentLink</div>
));

jest.mock("@/components/mine/Permit/Search/components/MarkdownViewer", () => () => (
    <div data-testid="markdown-viewer">MarkdownViewer</div>
));

jest.mock("@/components/common/ArtifactImagePreview", () => () => (
    <div data-testid="artifact-image-preview">ArtifactImagePreview</div>
));

describe("NowDocumentResultItem", () => {
    it("renders artifact category tag and emits category filter on click", () => {
        const onFilterClick = jest.fn();

        render(
            <NowDocumentResultItem
                result={{
                    id: "result-1",
                    content: "content",
                    score: 2.5,
                    meta: {
                        now_application_guid: "now-guid",
                        mine_guid: "mine-guid",
                        document_manager_guid: "docman-guid",
                        document_name: "test-doc.pdf",
                        document_type: "Supporting Document",
                        submitted_date: null,
                        artifact_type: "figure",
                        artifact_category: "site_photo",
                        artifact_page_number: 3,
                    },
                }}
                onFilterClick={onFilterClick}
            />
        );

        const categoryTag = screen.getByText("Site Photo");
        expect(categoryTag).toBeInTheDocument();

        fireEvent.click(categoryTag);
        expect(onFilterClick).toHaveBeenCalledWith("artifact_category", "site_photo");
    });
});
