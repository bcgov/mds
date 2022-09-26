import React from "react";
import { shallow } from "enzyme";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import { PARTY } from "@/tests/mocks/dataMocks";

let props = {};
let dispatchProps = {};

const setupProps = () => {
  props = {
    id: "1",
    input: {},
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

const setupDispatchProps = () => {
  dispatchProps = {
    handleChange: jest.fn(),
    handleSelect: jest.fn(),
  };
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("RenderAutoComplete", () => {
  it("renders properly", () => {
    props.data = PARTY.partyIds;
    props.option = PARTY.parties;
    const wrapper = shallow(<RenderAutoComplete {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
