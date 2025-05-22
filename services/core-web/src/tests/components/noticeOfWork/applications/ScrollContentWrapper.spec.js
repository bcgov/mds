import React from "react";
import { render } from "@testing-library/react";
import { ScrollContentWrapper } from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
};

const setupProps = () => {
  props.formValues = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.isLoaded = true;
  props.isViewMode = true;
  props.children = <></>;
  props.showContent = false;
  props.data = {};
  props.showActionsAndProgress = true;
  props.title = "Application Tab";
  props.id = "REV";
  props.history = { location: { state: { currentActiveLink: "mock link" } } };
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ScrollContentWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<ScrollContentWrapper {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
