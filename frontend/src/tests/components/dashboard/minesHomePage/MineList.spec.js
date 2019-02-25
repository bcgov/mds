import React from "react";
import { shallow } from "enzyme";
import MineList from "@/components/dashboard/minesHomePage/MineList";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.mineIds = MOCK.MINES.mineIds;
  props.mines = MOCK.MINES.mines;
  props.mineRegionHash = MOCK.REGION_HASH;
};

beforeEach(() => {
  setupProps();
});

describe("MineList", () => {
  it("renders properly", () => {
    const component = shallow(<MineList {...props} />);
    expect(component).toMatchSnapshot();
  });
});
