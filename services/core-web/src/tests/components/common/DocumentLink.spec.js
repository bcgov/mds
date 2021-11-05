import React from "react";
import { shallow } from "enzyme";
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
    const wrapper = shallow(<DocumentLink {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
