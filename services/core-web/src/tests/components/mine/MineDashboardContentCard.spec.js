import React from "react";
import { shallow } from "enzyme";
import { MineDashboardContentCard } from "@/components/mine/MineDashboardContentCard";

const props = {};

const setupProps = () => {
  props.content = "mock content";
  props.icon = null;
  props.title = "mock title";
};

beforeEach(() => {
  setupProps();
});

describe("MineDashboardContentCard", () => {
  it("renders properly", () => {
    const component = shallow(<MineDashboardContentCard {...props} />);
    expect(component).toMatchSnapshot();
  });
});
