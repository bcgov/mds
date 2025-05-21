import React from "react";
import { render } from "@testing-library/react";
import { MergeContactsDashboard } from "@/components/admin/contacts/MergeContactsDashboard";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.mergeParties = jest.fn();
};

const setupProps = () => {
  props.history = { replace: jest.fn() };
  props.location = { pathname: "" };
  props.match = { params: { tab: "" } };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MergeContactDashboard", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><MergeContactsDashboard {...dispatchProps} {...props} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
