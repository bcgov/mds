import React from "react";
import { shallow } from "enzyme";
import RenderCheckbox from "@/components/common/RenderCheckbox";

let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: "",
    label: "",
    meta: {
      touched: false,
      error: false,
    },
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderCheckbox", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderCheckbox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
