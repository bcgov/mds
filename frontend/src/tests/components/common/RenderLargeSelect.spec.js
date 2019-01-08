import React from "react";
import { shallow } from "enzyme";
import RenderLargeSelect from "@/components/common/RenderLargeSelect";

let props = {};

const setupProps = () => {
  props = {
    input: { value: "" },
    label: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    id: "parties",
    data: [],
    option: {},
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
