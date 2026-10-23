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

const result = {
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
    },
};

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

    it("labels archived files, without making the label a filter", () => {
        const onFilterClick = jest.fn();

        render(<NowDocumentResultItem result={result} onFilterClick={onFilterClick} isArchived />);

        fireEvent.click(screen.getByText("Archived"));
        expect(onFilterClick).not.toHaveBeenCalled();
    });

    it("doesn't label files that haven't been archived", () => {
        render(<NowDocumentResultItem result={result} />);

        expect(screen.queryByText("Archived")).not.toBeInTheDocument();
    });

    it("makes filter tags buttons, so they can be used with the keyboard", () => {
        const onFilterClick = jest.fn();
        const artifactResult = { ...result, meta: { ...result.meta, artifact_type: "figure", artifact_page_number: 3 } };

        render(<NowDocumentResultItem result={artifactResult} onFilterClick={onFilterClick} />);

        expect(screen.getByRole("button", { name: "Supporting Document" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Figure" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
        expect(onFilterClick).toHaveBeenCalledWith("artifact_page_number", "3");
    });

    it("doesn't make tags buttons when they can't filter the results", () => {
        render(<NowDocumentResultItem result={result} />);

        expect(screen.getByText("Supporting Document")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Supporting Document" })).not.toBeInTheDocument();
    });

    it("says whether the formatted table is shown", () => {
        const tableResult = { ...result, meta: { ...result.meta, artifact_type: "table", artifact_table_markdown: "| a |" } };

        render(<NowDocumentResultItem result={tableResult} />);

        const toggle = screen.getByRole("button", { name: /Show more/ });
        expect(toggle).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(toggle);

        expect(screen.getByRole("button", { name: /Show less/ })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByTestId("markdown-viewer")).toBeInTheDocument();
    });
});
