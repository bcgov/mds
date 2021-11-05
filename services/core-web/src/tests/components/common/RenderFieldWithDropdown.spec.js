import React from "react";
import { shallow } from "enzyme";
import RenderFieldWithDropdown from "@/components/common/RenderFieldWithDropdown";

let props = {};

const setupProps = () => {
  props = {
    id: "mockID",
    input: {},
    label: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    placeholder: "select from dropdown",
    inlineLabel: "Mock Label",
    disabled: false,
    defaultValue: "%",
    data: [],
    dropdownID: "mockDropdownID",
    mockID: {
      input: {},
      meta: {
        touched: false,
        error: false,
        warning: false,
      },
    },
    mockDropdownID: {
      input: {},
      meta: {
        touched: false,
        error: false,
        warning: false,
      },
    },
    names: ["mockID", "mockDropdownID"],
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderFieldWithDropdown", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RenderFieldWithDropdown {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
