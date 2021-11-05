import React from "react";
import { shallow } from "enzyme";
import { DocumentViewer } from "@/components/syncfusion/DocumentViewer";

const props = {};

const setupReducerProps = () => {
  props.documentPath = "mock path name";
  props.closeDocumentViewer = jest.fn();
  props.fetchInspectors = jest.fn();
  props.isDocumentViewerOpen = true;
  props.props = { title: "mock title" };
};

beforeEach(() => {
  setupReducerProps();
});

describe("DocumentViewer", () => {
  it("renders properly", () => {
    const component = shallow(<DocumentViewer {...props} />);
    expect(component).toMatchSnapshot();
  });
});
