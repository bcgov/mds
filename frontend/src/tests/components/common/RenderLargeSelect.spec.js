import React from "react";
import { shallow } from "enzyme";
import RenderLargeSelect from "@/components/common/RenderLargeSelect";

let props = {};

const setupProps = () => {
  props = {
    input: { value: "", onChange: jest.fn() },
    label: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    id: "parties",
    data: [],
    option: {},
    selectedOption: { key: "1" },
    handleChange: jest.fn(),
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderLargeSelect", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderLargeSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
