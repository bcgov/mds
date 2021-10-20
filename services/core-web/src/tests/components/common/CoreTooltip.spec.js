import React from "react";
import { shallow } from "enzyme";
import {
  CoreTooltip,
  NOWFieldOriginTooltip,
  NOWOriginalValueTooltip,
} from "@/components/common/CoreTooltip";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.title = "tooltip title";
  props.iconColor = "white";
  props.style = {};
  props.isVisible = false;
  props.originalValue = "mock value";
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("CoreTooltip", () => {
  it("renders properly", () => {
    const wrapper = shallow(<CoreTooltip {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe("NOWFieldOriginTooltip", () => {
  it("renders properly", () => {
    const wrapper = shallow(<NOWFieldOriginTooltip {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe("NOWOriginalValueTooltip", () => {
  it("renders properly", () => {
    const wrapper = shallow(<NOWOriginalValueTooltip {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
