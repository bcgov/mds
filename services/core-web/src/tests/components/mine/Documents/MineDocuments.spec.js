import React from "react";
import { shallow } from "enzyme";
import { MineDocuments } from "@/components/mine/Documents/MineDocuments";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.mineGuid = "18133c75-49ad-4101-85f3-a43e35ae989a";
  props.mines = MOCK.MINES.mines;
};

beforeEach(() => {
  setupProps();
});

describe("MineDocuments", () => {
  it("renders properly", () => {
    const component = shallow(<MineDocuments {...props} />);
    expect(component).toMatchSnapshot();
  });
});
