import React from "react";
import { shallow } from "enzyme";
import DocumentViewer from "@mds/common/components/syncfusion/DocumentViewer";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

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
    const component = render(
      <ReduxWrapper>
        <DocumentViewer {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
