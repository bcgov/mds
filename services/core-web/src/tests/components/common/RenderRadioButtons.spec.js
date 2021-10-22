import React from "react";
import { shallow } from "enzyme";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";

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
    customOptions: [],
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderRadioButtons", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderRadioButtons {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
