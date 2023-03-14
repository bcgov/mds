import React from "react";
import { shallow } from "enzyme";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";

let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: "",
    label: "",
    type: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    maximumCharacters: 0,
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderAutoSizeField", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderAutoSizeField {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
