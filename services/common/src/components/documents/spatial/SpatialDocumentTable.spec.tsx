import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import SpatialDocumentTable from "./SpatialDocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE } from "@mds/common/constants/strings";
import {
  ISpatialBundle,
  ISpatialBundleDocument,
} from "@mds/common/interfaces/document/spatialBundle.interface";

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
  downloadFileFromDocumentManager: jest.fn(),
}));
jest.mock("@mds/common/redux/actionCreators/documentActionCreator", () => ({
  documentsCompression: jest.fn(() => () => Promise.resolve({ data: {} })),
  pollDocumentsCompressionProgress: jest.fn(),
}));

const spatialDocuments = MOCK.PROJECT_SUMMARY.documents
  .filter(
    (d) =>
      d.project_summary_document_type_code === MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL
  )
  .map((d) => new MineDocument(d));

const bundleDocument = (
  overrides: Partial<ISpatialBundleDocument> = {}
): ISpatialBundleDocument => ({
  mine_document_guid: "doc-1",
  document_manager_guid: "manager-1",
  document_name: "boundary.shp",
  upload_date: "2024-01-01T00:00:00Z",
  create_user: "test_user",
  ...overrides,
});

describe("SpatialDocumentTable", () => {
  it("renders properly", async () => {
    const { container, findByTestId } = render(
      <ReduxWrapper>
        <SpatialDocumentTable documents={spatialDocuments} />
      </ReduxWrapper>
    );
    const spatialTable = await findByTestId("spatial-document-table");
    expect(spatialTable).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it("renders an authoritative bundle that has no matching document row", async () => {
    const invalidBundle: ISpatialBundle = {
      bundle_id: 29,
      name: "index (1) (1).kml",
      purpose_codes: [],
      validation_status: "INVALID",
      validation_error: "Unable to read geometry.",
      bundle_documents: [
        bundleDocument({
          mine_document_guid: "38bf4873-29d7-4c58-a6dc-c3686f51e0f5",
          document_manager_guid: "abc-123",
          document_name: "index (1) (1).kml",
        }),
      ],
    };

    const { getByText } = render(
      <ReduxWrapper>
        <SpatialDocumentTable documents={[]} spatialBundles={[invalidBundle]} />
      </ReduxWrapper>
    );

    expect(getByText("index (1) (1).kml")).toBeInTheDocument();
    expect(
      getByText((content) => content.includes("Failed") && content.includes("Unable to read geometry."))
    ).toBeInTheDocument();
  });

  it("renders missing extensions, bundle type, and editable purposes", async () => {
    const unableBundle: ISpatialBundle = {
      bundle_id: 30,
      name: "boundary",
      purpose_codes: [],
      validation_status: "UNABLE_TO_VALIDATE",
      validation_checks: { missing_extensions: [".prj"] },
      bundle_documents: [
        bundleDocument(),
        bundleDocument({
          mine_document_guid: "doc-2",
          document_manager_guid: "manager-2",
          document_name: "boundary.shx",
        }),
      ],
    };
    const purposeCodes = [
      {
        spatial_bundle_purpose_code: "MBD",
        description: "Mine Boundary",
        display_order: 10,
        active_ind: true,
      },
    ];

    render(
      <ReduxWrapper>
        <SpatialDocumentTable
          documents={[]}
          spatialBundles={[unableBundle]}
          purposeCodes={purposeCodes}
          canEditPurposes
          mineGuid="mine-guid"
        />
      </ReduxWrapper>
    );

    expect(await screen.findByText("Shapefile Bundle")).toBeInTheDocument();
    expect(screen.getByText(/Unable to validate — missing \.prj/)).toBeInTheDocument();
    expect(screen.getByText(/Shapefile bundle · \.shp \.shx \(missing \.prj\)/)).toBeInTheDocument();

    const purpose = screen.getByRole("checkbox", { name: "Mine Boundary" });
    fireEvent.click(purpose);
    await waitFor(() => expect(purpose).toBeChecked());
    fireEvent.click(purpose);
    await waitFor(() => expect(purpose).not.toBeChecked());
  });

  it.each([
    ["area.kml", "KML"],
    ["area.kmz", "KMZ"],
  ])("renders %s as a %s single-file bundle", async (name, expectedType) => {
    const bundle: ISpatialBundle = {
      bundle_id: name,
      name,
      geomark_id: "gm-test",
      purpose_codes: [],
      validation_status: "VALID",
      bundle_documents: [
        bundleDocument({
          mine_document_guid: `${name}-doc`,
          document_manager_guid: `${name}-manager`,
          document_name: name,
        }),
      ],
    };

    render(
      <ReduxWrapper>
        <SpatialDocumentTable documents={[]} spatialBundles={[bundle]} />
      </ReduxWrapper>
    );

    expect(await screen.findByText(expectedType)).toBeInTheDocument();
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(screen.getByText(`Single file · .${name.split(".").pop()}`)).toBeInTheDocument();

    const actions = screen.getByRole("button", { name: /Actions/i });
    fireEvent.mouseEnter(actions);
    fireEvent.click(await screen.findByTestId("action-button-download"));
  });

  it("opens validation actions for a valid shapefile bundle", async () => {
    const validBundle: ISpatialBundle = {
      bundle_id: 31,
      name: "boundary",
      geomark_id: "gm-test",
      purpose_codes: [],
      validation_status: "VALID",
      bundle_documents: [
        bundleDocument(),
        bundleDocument({
          mine_document_guid: "doc-2",
          document_manager_guid: "manager-2",
          document_name: "boundary.shx",
        }),
      ],
    };

    render(
      <ReduxWrapper>
        <SpatialDocumentTable
          documents={[]}
          spatialBundles={[validBundle]}
          mineGuid="mine-guid"
          purposeCodes={[
            {
              spatial_bundle_purpose_code: "MBD",
              description: "Mine Boundary",
              display_order: 10,
              active_ind: true,
            },
          ]}
        />
      </ReduxWrapper>
    );

    const actions = await screen.findByRole("button", { name: /Actions/i });
    fireEvent.mouseEnter(actions);
    fireEvent.click(await screen.findByText("Preview Shape"));

    fireEvent.mouseEnter(actions);
    fireEvent.click(await screen.findByText("Details"));
    expect(await screen.findByText("Validation Checks")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /download Download/i }));

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("link", { name: "plus-square" }));
    expect(await screen.findByText("boundary.shp")).toBeInTheDocument();
  });

  it("renders a pending generic single spatial file", async () => {
    const pendingBundle: ISpatialBundle = {
      bundle_id: 32,
      name: "area.geojson",
      purpose_codes: [],
      bundle_documents: [],
    };

    render(
      <ReduxWrapper>
        <SpatialDocumentTable
          documents={[]}
          spatialBundles={[pendingBundle]}
          categoryText="Imported"
          purposeCodes={[
            {
              spatial_bundle_purpose_code: "MBD",
              description: "Mine Boundary",
              display_order: 10,
              active_ind: true,
            },
          ]}
          canEditPurposes
        />
      </ReduxWrapper>
    );

    expect((await screen.findAllByText("Spatial File")).length).toBeGreaterThan(0);
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Imported")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Mine Boundary" }));

    const actions = screen.getByRole("button", { name: /Actions/i });
    fireEvent.mouseEnter(actions);
    fireEvent.click(await screen.findByTestId("action-button-download"));
  });
});
