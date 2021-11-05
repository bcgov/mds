import React from "react";
import { shallow } from "enzyme";
import LinkButton from "@/components/common/buttons/LinkButton";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.tabIndex = 1;
  props.style = {};
  props.children = <></>;
};

const setupDispatchProps = () => {
  dispatchProps.onClick = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("LinkButton", () => {
  it("renders properly", () => {
    const wrapper = shallow(<LinkButton {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
