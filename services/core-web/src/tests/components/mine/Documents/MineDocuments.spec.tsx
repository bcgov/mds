import React from "react";
import { shallow } from "enzyme";
import { MineDocuments } from "@/components/mine/Documents/MineDocuments";
import * as MOCK from "@/tests/mocks/dataMocks";

const setupProps = () => ({
  mines: MOCK.MINES.mines,
  mineGuid: "18133c75-49ad-4101-85f3-a43e35ae989a",
});

describe("MineDocuments", () => {
  it("renders properly", () => {
    const component = shallow(<MineDocuments {...setupProps()} />);
    expect(component).toMatchSnapshot();
  });
});
