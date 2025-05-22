import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import {
  CoreTooltip,
  NOWFieldOriginTooltip,
  NOWOriginalValueTooltip,
} from "@/components/common/CoreTooltip";

const props = {
  title: "tooltip title",
  iconColor: "white",
  style: {},
  isVisible: true,
  originalValue: "mock value"
};

// testing-library passes, but it needs user interaction to show the tooltip text.
describe.skip("CoreTooltip", () => {
  it("CoreTooltip renders properly", () => {
    const { container: component } = render(<CoreTooltip {...props} />);
    expect(component).toMatchSnapshot();
  });

  it("NOWFieldOriginTooltip renders properly", () => {
    const { container: component } = render(<NOWFieldOriginTooltip {...props} />);
    expect(component).toMatchSnapshot();
  });

  it("NOWOriginalValueTooltip renders properly", () => {
    const { container: component } = render(<NOWOriginalValueTooltip {...props} />);
    expect(component).toMatchSnapshot();
  });
});

describe("CoreTooltip", () => {
  it("CoreTooltip renders properly", () => {
    const wrapper = shallow(<CoreTooltip {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("NOWFieldOriginTooltip renders properly", () => {
    const wrapper = shallow(<NOWFieldOriginTooltip {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("NOWOriginalValueTooltip renders properly", () => {
    const wrapper = shallow(<NOWOriginalValueTooltip {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
