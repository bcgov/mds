import React from "react";
import { shallow } from "enzyme";
import RenderScrollField from "@/components/common/RenderScrollField";

let props = {};

const setupProps = () => {
  props = {
    id: "1",
    input: "",
    label: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    disabled: false,
    placeholder: "scroll",
    rows: 2,
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderScrollField", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderScrollField {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
