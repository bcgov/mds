import React from "react";
import { shallow } from "enzyme";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";

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
    maximumCharacters: 300,
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
