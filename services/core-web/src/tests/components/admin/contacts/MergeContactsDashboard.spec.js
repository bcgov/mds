import React from "react";
import { shallow } from "enzyme";
import { MergeContainer } from "@/components/admin/contacts/MergeContainer";

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
  props.userRoles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MergeContactDashboard", () => {
  it("renders properly", () => {
    const component = shallow(<MergeContainer {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
