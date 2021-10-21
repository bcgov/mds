import React from "react";
import { shallow } from "enzyme";
import { RenderMineSelect } from "@/components/common/RenderMineSelect";
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
    name: "field",
    fetchMineNameList: jest.fn(),
    mineNameList: [],
    placeholder: "Select",
    disabled: false,
    majorMineOnly: false,
    onMineSelect: jest.fn(),
    fullWidth: true,
    additionalPin: [],
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderMineSelect", () => {
  it("renders properly", () => {
    props.data = PARTY.partyIds;
    props.option = PARTY.parties;
    const wrapper = shallow(<RenderMineSelect {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
