import React from "react";
import { shallow } from "enzyme";
import UpdateMinespaceUserModal from "@/components/modalContent/UpdateMinespaceUserModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mock title";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("UpdateMinespaceUserModal", () => {
  it("renders properly", () => {
    const component = shallow(<UpdateMinespaceUserModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
