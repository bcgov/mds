import React from "react";
import { shallow } from "enzyme";
import RenderYear from "@/components/common/RenderYear";

let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: { value: "" },
    label: "Time",
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

describe("RenderYear", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderYear {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
