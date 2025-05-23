import React from "react";
import { render } from "@testing-library/react";
import { DocumentLink } from "@/components/common/DocumentLink";

const props = {
  documentManagerGuid: "mockGuid",
  documentName: "Mock name",
  linkTitleOverride: "Mock Title",
  truncateDocumentName: true,
};
const dispatchProps = {
  openDocument: jest.fn(),
  onClickAlternative: jest.fn(),
};

describe("DocumentLink", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <DocumentLink {...props} {...dispatchProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
