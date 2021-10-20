import React from "react";
import { shallow } from "enzyme";
import { ScrollToTopWrapper } from "@/components/common/wrappers/ScrollToTopWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.location = { hash: "", pathname: "/dashboard" };
  props.children = "";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ScrollToTopWrapper", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ScrollToTopWrapper {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
