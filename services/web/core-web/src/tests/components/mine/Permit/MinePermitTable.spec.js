import React from "react";
import { shallow } from "enzyme";
import { MinePermitTable } from "@/components/mine/Permit/MinePermitTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.permits = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers;
  props.partyRelationships = MOCK.PARTYRELATIONSHIPS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinePermitTable", () => {
  it("renders properly", () => {
    const component = shallow(<MinePermitTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
