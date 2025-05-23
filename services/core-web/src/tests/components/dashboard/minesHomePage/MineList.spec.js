import React from "react";
import { render } from "@testing-library/react";
import MineList from "@/components/dashboard/minesHomePage/MineList";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {
  mines: MOCK.MINES.mines,
  mineRegionHash: MOCK.REGION_HASH,
  mineTenureHash: MOCK.TENURE_HASH,
};

describe("MineList", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <MineList {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
