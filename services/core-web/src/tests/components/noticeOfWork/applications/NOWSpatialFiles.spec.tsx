import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ISpatialBundle } from "@mds/common/interfaces/document/spatialBundle.interface";
import NOWSpatialFiles from "@/components/noticeOfWork/applications/NOWSpatialFiles";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const INVALID_BUNDLE: ISpatialBundle = {
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
    bc_albers: false,
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
            spatialDocumentBundles={[INVALID_BUNDLE]}
            isViewMode
            mineGuid="mine-guid"
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

  it("scrolls to the panel when another table links to it, leaving it collapsed", () => {
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    const { queryByText, rerender } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <NOWSpatialFiles
            spatialDocumentBundles={[INVALID_BUNDLE]}
            isViewMode
            mineGuid="mine-guid"
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(queryByText("index (1) (1).kml")).not.toBeInTheDocument();

    rerender(
      <ReduxWrapper>
        <BrowserRouter>
          <NOWSpatialFiles
            spatialDocumentBundles={[INVALID_BUNDLE]}
            isViewMode
            mineGuid="mine-guid"
            scrollRequestId={1}
          />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(queryByText("index (1) (1).kml")).not.toBeInTheDocument();
  });

  it("returns null when there are no documents and no bundles", () => {
    const { container } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <NOWSpatialFiles spatialDocumentBundles={[]} isViewMode mineGuid="mine-guid" />
        </BrowserRouter>
      </ReduxWrapper>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
