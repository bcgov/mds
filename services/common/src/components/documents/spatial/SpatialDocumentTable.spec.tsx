import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import SpatialDocumentTable from "./SpatialDocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE } from "@mds/common/constants/strings";

const spatialDocuments = MOCK.PROJECT_SUMMARY.documents
  .filter(
    (d) =>
      d.project_summary_document_type_code === MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL
  )
  .map((d) => new MineDocument(d));

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
    const invalidBundle = {
      bundle_id: 29,
      name: "index (1) (1).kml",
      geomark_id: null,
      purpose_codes: [],
      validation_status: "INVALID",
      validation_error: "Unable to read geometry.",
      bundle_documents: [
        {
          mine_document_guid: "38bf4873-29d7-4c58-a6dc-c3686f51e0f5",
          document_manager_guid: "abc-123",
          document_name: "index (1) (1).kml",
        },
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
});
