import React from "react";
import { shallow } from "enzyme";
import { MineComplianceCard } from "@/components/mine/Compliance/MineComplianceCard";

const props = {};

const setupProps = () => {
  props.content = "mock content";
  props.icon = null;
  props.title = "mock title";
};

beforeEach(() => {
  setupProps();
});

describe("MineComplianceCard", () => {
  it("renders properly", () => {
    const component = shallow(<MineComplianceCard {...props} />);
    expect(component).toMatchSnapshot();
  });
});
