import React from "react";
import { render } from "@testing-library/react";
import { MineDashboardContentCard } from "@/components/mine/MineDashboardContentCard";

const props = {
  content: "mock content",
  icon: null,
  title: "mock title",
};

describe("MineDashboardContentCard", () => {
  it("renders properly", () => {
    const { container: component } = render(<MineDashboardContentCard {...props} />);
    expect(component).toMatchSnapshot();
  });
});
