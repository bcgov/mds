import React from "react";
import { render } from "@testing-library/react";
import { DocumentLink } from "@/components/common/DocumentLink";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.openDocument = jest.fn();
  dispatchProps.onClickAlternative = jest.fn();
};

const setupProps = () => {
  props.documentManagerGuid = "mockGuid";
  props.documentName = "Mock name";
  props.linkTitleOverride = "Mock Title";
  props.truncateDocumentName = true;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("DocumentLink", () => {
  it("renders properly", () => {
    const { container: component } = render(<DocumentLink {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
