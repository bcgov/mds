import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ArtifactImagePreview from "@/components/common/ArtifactImagePreview";

describe("ArtifactImagePreview", () => {
    it("renders image preview with accessible alt text", () => {
        render(
            <ArtifactImagePreview
                src="https://example.com/artifact.png"
                alt="Artifact preview for report"
                imageClassName="test-image"
                wrapperClassName="test-wrapper"
            />
        );

        expect(screen.getByAltText("Artifact preview for report")).toBeInTheDocument();
    });

    it("renders fallback message when image fails to load", () => {
        render(
            <ArtifactImagePreview
                src="https://example.com/broken-artifact.png"
                alt="Broken artifact preview"
            />
        );

        fireEvent.error(screen.getByAltText("Broken artifact preview"));

        expect(
            screen.getByText("Preview unavailable. Open the document for the full artifact.")
        ).toBeInTheDocument();
    });
});