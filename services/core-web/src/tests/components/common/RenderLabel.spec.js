import React from "react";
import { shallow } from "enzyme";
import RenderLabel from "@/components/common/RenderLabel";

let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: "",
    label: "",
    indentText: "test",
    className: "template-letter-content",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderLabel", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderLabel {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
