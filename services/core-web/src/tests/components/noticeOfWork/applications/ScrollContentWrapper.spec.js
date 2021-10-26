import React from "react";
import { shallow } from "enzyme";
import { ScrollContentWrapper } from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import * as NOWMocks from "@/tests/mocks/noticeOfWorkMocks";

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
    const component = shallow(<ScrollContentWrapper {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
