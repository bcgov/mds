import React from "react";
import { shallow } from "enzyme";
import { MergeContactsDashboard } from "@/components/admin/contacts/MergeContactsDashboard";

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
    const component = shallow(<MergeContactsDashboard {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
