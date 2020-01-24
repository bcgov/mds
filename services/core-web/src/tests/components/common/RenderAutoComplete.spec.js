import React from "react";
import { shallow } from "enzyme";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import { MINE_NAME_LIST } from "@/tests/mocks/dataMocks";

let props = {};

const setupProps = () => {
  props = {
    data: [],
    placeholder: "",
    handleSelect: jest.fn(),
    handleChange: jest.fn(),
    meta: {},
    input: {},
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderAutoComplete", () => {
  it("renders properly", () => {
    props.data = MINE_NAME_LIST;
    const wrapper = shallow(<RenderAutoComplete {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
