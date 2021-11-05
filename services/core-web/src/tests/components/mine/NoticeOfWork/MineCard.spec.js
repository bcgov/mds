import React from "react";
import { shallow } from "enzyme";
import { MineCard } from "@/components/mine/NoticeOfWork/MineCard";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.additionalPin = [];
  props.mineRegionHash = MOCK.REGION_HASH;
};

const setupDispatchProps = () => {};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineCard", () => {
  it("renders properly", () => {
    const component = shallow(<MineCard {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
