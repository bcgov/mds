import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@/tests/mocks/dataMocks";
import { MineApplicationTable } from "@/components/mine/Applications/MineApplicationTable";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.major_mine_ind = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].major_mine_ind;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineApplicationTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineApplicationTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
