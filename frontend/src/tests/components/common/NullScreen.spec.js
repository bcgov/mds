import React from "react";
import { shallow } from "enzyme";
import NullScreen from "@/components/common/NullScreen";

const props = {};

const setupProps = () => {
  props.type = "dashboard";
};

beforeEach(() => {
  setupProps();
});

describe("NullScreen", () => {
  it("renders properly", () => {
    const wrapper = shallow(<NullScreen {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
