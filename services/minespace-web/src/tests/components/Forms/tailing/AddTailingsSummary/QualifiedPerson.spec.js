import React from "react";
import { shallow } from "enzyme";
import { QualifiedPerson } from "@common/components/tailings/QualifiedPerson";

let dispatchProps = {};
let props = {};

const setupDispatchProps = () => {
  dispatchProps = {
    openModal: jest.fn(),
    closeModal: jest.fn(),
    change: jest.fn(),
  };
};

const setupProps = () => {
  props = {
    formValues: {},
  };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("QualifiedPerson", () => {
  it("renders properly", () => {
    const component = shallow(<QualifiedPerson {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
