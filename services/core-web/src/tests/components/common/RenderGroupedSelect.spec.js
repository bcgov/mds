import React from "react";
import { shallow } from "enzyme";
import RenderGroupedSelect from "@/components/common/RenderGroupedSelect";

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
    disabled: false,
    data: [],
    option: {},
    selectedOption: { key: "1" },
    handleChange: jest.fn(),
    usedOptions: {},
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderGroupedSelect", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderGroupedSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
