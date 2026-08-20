import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NOWSpatialFiles from "@/components/noticeOfWork/applications/NOWSpatialFiles";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const INVALID_BUNDLE = {
  bundle_id: 29,
  bundle_guid: "71b9e45e-ff14-44da-8ba3-aff1d74ba80f",
  name: "index (1) (1).kml",
  docman_bundle_guid: "16c70185-fdbb-40f1-b8ee-1002bc41481b",
  geomark_id: null,
  purpose_codes: [],
  bundle_documents: [
    {
      mine_document_guid: "38bf4873-29d7-4c58-a6dc-c3686f51e0f5",
      document_manager_guid: "abc-123",
      document_name: "index (1) (1).kml",
      upload_date: "2026-08-18",
      create_user: "tester",
    },
  ],
  validation_checks: {
    in_bc: null,
    extent: null,
    bc_albers: false,
    geometry_type: null,
    file_size_gt_0: true,
  },
  validation_error: "Unable to read geometry. Check the file is a valid format=KML - Google Earth file.",
  validation_status: "INVALID",
};

describe("NOWSpatialFiles", () => {
  it("starts collapsed and reveals the bundle rows once expanded", () => {
    const { getByRole, getByText, queryByText } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <NOWSpatialFiles
            filteredSubmissionDocuments={[]}
            documents={[]}
            spatialDocumentBundles={[INVALID_BUNDLE]}
            isViewMode
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(getByText("Spatial Files")).toBeInTheDocument();
    expect(getByText("1 detected")).toBeInTheDocument();
    expect(queryByText("index (1) (1).kml")).not.toBeInTheDocument();

    fireEvent.click(getByRole("button", { expanded: false }));

    expect(getByText("index (1) (1).kml")).toBeInTheDocument();
    expect(
      getByText((content) => content.includes("Failed") && content.includes("Unable to read geometry."))
    ).toBeInTheDocument();
  });

  it("expands the panel when another table asks it to reveal a file", () => {
    const { getByText, queryByText, rerender } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <NOWSpatialFiles
            filteredSubmissionDocuments={[]}
            documents={[]}
            spatialDocumentBundles={[INVALID_BUNDLE]}
            isViewMode
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(queryByText("index (1) (1).kml")).not.toBeInTheDocument();

    rerender(
      <ReduxWrapper>
        <BrowserRouter>
          <NOWSpatialFiles
            filteredSubmissionDocuments={[]}
            documents={[]}
            spatialDocumentBundles={[INVALID_BUNDLE]}
            isViewMode
            focusRequest={{ requestId: 1, documentManagerGuid: "abc-123" }}
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(getByText("index (1) (1).kml")).toBeInTheDocument();
  });

  it("returns null when there are no documents and no bundles", () => {
    const { container } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <NOWSpatialFiles
            filteredSubmissionDocuments={[]}
            documents={[]}
            spatialDocumentBundles={[]}
            isViewMode
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
