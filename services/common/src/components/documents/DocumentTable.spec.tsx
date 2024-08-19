import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import DocumentTable from "./DocumentTable";
import { MineDocument } from "@mds/common/models/documents/document";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const documents = MOCK.PROJECT_SUMMARY.documents.map((d) => new MineDocument(d));

describe("DocumentTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <DocumentTable documents={documents} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
