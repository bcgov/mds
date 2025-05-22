import React from "react";
import { render } from "@testing-library/react";
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
    const { container: component } = render(<MineDashboardContentCard {...props} />);
    expect(component).toMatchSnapshot();
  });
});
