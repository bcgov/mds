import React from "react";
import DocumentViewer from "@mds/common/components/syncfusion/DocumentViewer";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {
  documentPath: "mock path name",
  closeDocumentViewer: jest.fn(),
  fetchInspectors: jest.fn(),
  isDocumentViewerOpen: true,
  props: { title: "mock title" },
};

describe("DocumentViewer", () => {
  it("renders properly", () => {
    const component = render(
      <ReduxWrapper>
        <DocumentViewer {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
