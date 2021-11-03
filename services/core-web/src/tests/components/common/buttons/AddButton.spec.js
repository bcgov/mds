import React from "react";
import { shallow } from "enzyme";
import AddButton from "@/components/common/buttons/AddButton";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.children = <></>;
};

const setupDispatchProps = () => {
  dispatchProps.onClick = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("AddButton", () => {
  it("renders properly", () => {
    const wrapper = shallow(<AddButton {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
