import React from "react";
import { shallow } from "enzyme";
import RenderSelect from "@/components/common/RenderSelect";
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

describe("RenderSelect", () => {
  it("renders properly", () => {
    props.data = PARTY.partyIds;
    props.option = PARTY.parties;
    const wrapper = shallow(<RenderSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
