import React from "react";
import { shallow } from "enzyme";
import { LoadingWrapper } from "@/components/common/wrappers/LoadingWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.condition = false;
  props.children = "";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("LoadingWrapper", () => {
  it("renders properly", () => {
    const wrapper = shallow(<LoadingWrapper {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
