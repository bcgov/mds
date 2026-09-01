import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ISpatialBundle } from "@mds/common/interfaces/document/spatialBundle.interface";
import { AUTHENTICATION, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { BULK_STATIC_CONTENT_RESPONSE } from "@mds/common/tests/mocks/dataMocks";
import NOWSpatialFiles from "@/components/noticeOfWork/applications/NOWSpatialFiles";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import * as Permission from "@/constants/permissions";

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

// The purpose column only renders once the codes are in static content, and the checkbox is
// only enabled for a user holding the mapped Keycloak role rather than the permission key.
const stateWithRoles = (userAccessData: string[]) => ({
  [AUTHENTICATION]: { userAccessData, userInfo: {} },
  [STATIC_CONTENT]: {
    ...BULK_STATIC_CONTENT_RESPONSE,
    spatialBundlePurposeCodes: [
      {
        spatial_bundle_purpose_code: "MBD",
        description: "Mine Boundary",
        display_order: 10,
        active_ind: true,
      },
    ],
  },
});

const renderExpanded = (userAccessData: string[]) => {
  const utils = render(
    <ReduxWrapper initialState={stateWithRoles(userAccessData)}>
      <BrowserRouter>
        <NOWSpatialFiles
          spatialDocumentBundles={[INVALID_BUNDLE]}
          isViewMode={false}
          mineGuid="mine-guid"
        />
      </BrowserRouter>
    </ReduxWrapper>
  );

  fireEvent.click(utils.getByRole("button", { expanded: false }));
  return utils;
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

  it("enables the Mine Boundary checkbox for a user who can edit permits", () => {
    const { getByRole } = renderExpanded([USER_ROLES[Permission.EDIT_PERMITS]]);

    expect(getByRole("checkbox", { name: "Mine Boundary" })).toBeEnabled();
  });

  it("disables the Mine Boundary checkbox for a user without the edit permits role", () => {
    const { getByRole } = renderExpanded(["core_view_all"]);

    expect(getByRole("checkbox", { name: "Mine Boundary" })).toBeDisabled();
  });
});
