import React from "react";
import { shallow } from "enzyme";
import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import { ApplicationGuard } from "@/HOC/ApplicationGuard";

const Component = ApplicationGuard(() => <div>Test</div>);
const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.clearNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchOriginalNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportNoticeOfWorkSubmissionDocumentsJob = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.location = {};
  reducerProps.history = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("ApplicationGuard", () => {
  it("should render the `WrappedComponent` if `isLoaded`", () => {
    const component = shallow(<Component.WrappedComponent {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
    expect(component.html()).toEqual("<div>Test</div>");
    expect(component.find(Loading).length).toEqual(0);
    expect(component.find(NullScreen).length).toEqual(0);
  });
});
