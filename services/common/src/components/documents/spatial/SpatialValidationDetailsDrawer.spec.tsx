import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SpatialValidationDetailsDrawer from "./SpatialValidationDetailsDrawer";

jest.mock("./ViewSpatialDetail", () => ({
  GeomarkMapPreview: ({ geomarkId, height }) => (
    <div data-testid="geomark-map-preview" data-height={height}>
      {geomarkId}
    </div>
  ),
}));

const GLOSSARY_URL = "https://apps.gov.bc.ca/pub/geomark/docs/glossary.html";

describe("SpatialValidationDetailsDrawer", () => {
  const bundle = {
    bundle_id: 1,
    name: "Legacy_Boundary_2024",
    validation_status: "INVALID",
    validation_error: "Not in BC Albers",
    validation_checks: {
      in_bc: true,
      bc_albers: false,
      file_size_gt_0: true,
      missing_extensions: [".prj"],
      found_projection: "UTM (northern hemisphere)",
      declared_projection: "NAD83 / BC Albers (EPSG:3005)",
      expected_projection: "NAD83 / BC Albers (EPSG:3005)",
      geometry_type: "Polygon",
      extent: { minX: 1, minY: 2, maxX: 3, maxY: 4 },
    },
    bundleFiles: [
      { document_name: "Legacy_Boundary_2024.shp" },
      { document_name: "Legacy_Boundary_2024.shx" },
      { document_name: "Legacy_Boundary_2024.dbf" },
    ],
  };

  it("renders validation checks and metadata", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={bundle as any}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByText("Legacy_Boundary_2024")).toHaveLength(2);
    expect(screen.getByText("Location is within BC")).toBeInTheDocument();
    expect(screen.getByText("Is in BC Albers projection")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Required: NAD83 \/ BC Albers \(EPSG:3005\).*Coordinates suggest: UTM \(northern hemisphere\)/
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Geometry Type:/)).toBeInTheDocument();
    expect(screen.getByText("Polygon")).toBeInTheDocument();
    expect(screen.getByText(/Expected Projection:/)).toBeInTheDocument();
    expect(screen.getByText("Legacy_Boundary_2024.shp")).toBeInTheDocument();
    expect(screen.getByText(".prj file not found")).toBeInTheDocument();
    expect(screen.getByText("Map preview unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Manage Documents")).not.toBeInTheDocument();
    expect(screen.queryByText(/Feature Count/)).not.toBeInTheDocument();
  });

  it("offers a Download button directly under the validation checks", () => {
    const onDownload = jest.fn();
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={bundle as any}
          onDownload={onDownload}
        />
      </MemoryRouter>
    );

    const download = screen.getByRole("button", { name: /download/i });
    const headings = screen.getAllByRole("heading").map((heading) => heading.textContent);

    expect(
      download.compareDocumentPosition(screen.getByText("Location is within BC")) &
        Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();
    expect(headings.indexOf("Preview")).toBeGreaterThan(headings.indexOf("Validation Checks"));

    fireEvent.click(download);
    expect(onDownload).toHaveBeenCalled();
  });

  it("omits the Download button when no download handler is provided", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer open onClose={jest.fn()} bundle={bundle as any} />
      </MemoryRouter>
    );

    expect(screen.queryByRole("button", { name: /download/i })).not.toBeInTheDocument();
  });

  it("puts Validation Checks above the preview and metadata", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={{ ...bundle, geomark_id: "gm-test" } as any}
        />
      </MemoryRouter>
    );

    const sections = screen.getAllByRole("heading").map((heading) => heading.textContent);

    expect(sections.indexOf("Validation Checks")).toBeGreaterThanOrEqual(0);
    expect(sections.indexOf("Validation Checks")).toBeLessThan(sections.indexOf("Preview"));
    expect(sections.indexOf("Preview")).toBeLessThan(sections.indexOf("Metadata"));
  });

  it("omits Geomark attribution rows when Geomark reported none", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer open onClose={jest.fn()} bundle={bundle as any} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Vertices:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Area:/)).not.toBeInTheDocument();
    expect(screen.queryByText("Geometry is valid")).not.toBeInTheDocument();
    expect(screen.queryByText("Geometry is robust")).not.toBeInTheDocument();
  });

  it("renders the GeoMark preview, purpose and Geomark attribution", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={
            {
              ...bundle,
              validation_status: "VALID",
              validation_error: undefined,
              geomark_id: "gm-test",
              purpose_codes: ["MINE_BOUNDARY"],
              validation_checks: {
                ...bundle.validation_checks,
                extent: {
                  minX: -144.664931,
                  minY: 47.527035,
                  maxX: -112.989186,
                  maxY: 60.724742,
                },
                centroid: { centroidX: -128.104468, centroidY: 54.745332 },
                num_parts: 1,
                num_vertices: 13,
                area: 5000000,
                length: 12500,
                minimum_clearance: 0.0004,
                is_valid: true,
                is_simple: true,
                is_robust: false,
              },
            } as any
          }
          purposeCodes={[
            {
              spatial_bundle_purpose_code: "MINE_BOUNDARY",
              description: "Mine Boundary",
            } as any,
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId("geomark-map-preview")).toHaveTextContent("gm-test");
    expect(screen.getByText("Mine Boundary")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("500 ha")).toBeInTheDocument();
    expect(screen.getByText("12.5 km")).toBeInTheDocument();
    expect(screen.getByText("54.745332, -128.104468")).toBeInTheDocument();
    expect(
      screen.getByText("W -144.664931 · S 47.527035 · E -112.989186 · N 60.724742")
    ).toBeInTheDocument();
    expect(screen.getByText("0.0004 m")).toBeInTheDocument();
  });

  it("reports the Geomark geometry attributes as metadata rather than validation checks", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={
            {
              ...bundle,
              validation_checks: {
                ...bundle.validation_checks,
                is_valid: true,
                is_simple: true,
                is_robust: false,
                minimum_clearance: 4.325,
              },
            } as any
          }
        />
      </MemoryRouter>
    );

    // The metadata list labels every row "<term>:"; the checks list renders the bare label.
    expect(screen.getByText("Geometry is valid:")).toBeInTheDocument();
    expect(screen.getByText("Geometry is simple:")).toBeInTheDocument();
    expect(screen.getByText("Geometry is robust:")).toBeInTheDocument();
    expect(screen.getByText("Minimum Clearance:")).toBeInTheDocument();
    expect(screen.queryByText("Geometry is valid")).not.toBeInTheDocument();
    expect(screen.queryByText("Geometry is simple")).not.toBeInTheDocument();
    expect(screen.queryByText("Geometry is robust")).not.toBeInTheDocument();

    expect(screen.getAllByText("Yes")).toHaveLength(2);
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("4.325 m")).toBeInTheDocument();
  });

  it("links each Geomark glossary term to the glossary in a new tab", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={
            {
              ...bundle,
              validation_checks: {
                ...bundle.validation_checks,
                is_valid: true,
                is_simple: false,
                is_robust: true,
                minimum_clearance: 4.325,
              },
            } as any
          }
        />
      </MemoryRouter>
    );

    ["isValid", "isSimple", "isRobust", "minimumClearance"].forEach((term) => {
      const help = screen.getByRole("link", {
        name: `Geomark glossary definition of ${term}`,
      });
      expect(help).toHaveAttribute("href", `${GLOSSARY_URL}#${term}`);
      expect(help).toHaveAttribute("target", "_blank");
      expect(help).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("shows a compact preview that expands into a modal", async () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={{ ...bundle, geomark_id: "gm-test" } as any}
        />
      </MemoryRouter>
    );

    // The drawer is itself a dialog, so the expanded map is identified by the modal wrapper.
    const findModal = () =>
      screen.queryAllByRole("dialog").find((dialog) => dialog.closest(".ant-modal"));

    const preview = screen.getByTestId("spatial-map-preview");
    expect(preview).toHaveStyle({ height: "200px", overflow: "hidden" });
    expect(screen.getByTestId("geomark-map-preview")).toHaveAttribute("data-height", "200");
    expect(findModal()).toBeUndefined();

    fireEvent.click(preview);

    await waitFor(() => expect(findModal()).toBeDefined());
    expect(screen.getAllByTestId("geomark-map-preview")).toHaveLength(2);
    expect(within(findModal()).getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("does not offer a clickable preview without a geomark", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer open onClose={jest.fn()} bundle={bundle as any} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("spatial-map-preview")).not.toBeInTheDocument();
    expect(screen.getByText("Map preview unavailable")).toBeInTheDocument();
  });

  it("links only to the glossary, never to the Geomark resource", () => {
    render(
      <MemoryRouter>
        <SpatialValidationDetailsDrawer
          open
          onClose={jest.fn()}
          bundle={
            {
              ...bundle,
              geomark_id: "gm-test",
              validation_checks: { ...bundle.validation_checks, is_valid: true },
            } as any
          }
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole("link", { name: "gm-test" })).not.toBeInTheDocument();
    screen.queryAllByRole("link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      expect(href).not.toContain("/geomarks/");
      expect(href).not.toContain("gm-test");
    });
  });
});
