import React from "react";
import { shallow } from "enzyme";
import WarningBanner from "@/components/common/WarningBanner";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onClose = jest.fn();
};

const setupProps = () => {
  props.type = "test";
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("WarningBanner", () => {
  it("renders properly", () => {
    const wrapper = shallow(<WarningBanner {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
