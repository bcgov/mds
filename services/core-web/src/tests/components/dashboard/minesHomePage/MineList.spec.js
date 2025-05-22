import React from "react";
import { render } from "@testing-library/react";
import MineList from "@/components/dashboard/minesHomePage/MineList";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.mines = MOCK.MINES.mines;
  props.mineRegionHash = MOCK.REGION_HASH;
  props.mineTenureHash = MOCK.TENURE_HASH;
};

beforeEach(() => {
  setupProps();
});

describe("MineList", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><MineList {...props} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
