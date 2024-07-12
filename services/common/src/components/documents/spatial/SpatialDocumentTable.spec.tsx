import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE } from "@mds/common/constants";
import SpatialDocumentTable from "./SpatialDocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";

const spatialDocuments = MOCK.PROJECT_SUMMARY.documents
  .filter(
    (d) =>
      d.project_summary_document_type_code === MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL
  )
  .map((d) => new MineDocument(d));

describe("SpatialDocumentTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <SpatialDocumentTable documents={spatialDocuments} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
