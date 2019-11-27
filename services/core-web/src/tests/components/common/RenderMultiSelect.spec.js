import React from "react";
import { shallow } from "enzyme";
import RenderMultiSelect from "@/components/common/RenderMultiSelect";
import { PARTY } from "@/tests/mocks/dataMocks";

let props = {};

const setupProps = () => {
  props = {
    id: "1",
    input: "",
    label: "",
    type: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
    data: [],
    option: {},
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderMultiSelect", () => {
  it("renders properly", () => {
    props.data = PARTY.partyIds;
    props.option = PARTY.parties;
    const wrapper = shallow(<RenderMultiSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
