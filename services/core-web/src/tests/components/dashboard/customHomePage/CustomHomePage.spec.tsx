import React from "react";
import { render } from "@testing-library/react";
import CustomHomePage from "@/components/dashboard/customHomePage/CustomHomePage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const initialState = {
  mines: {
    subscribedMines: MOCK.SUBSCRIBED_MINES.mines,
  },
};

describe("CustomHomePage", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter>
      <ReduxWrapper initialState={initialState}>
        <CustomHomePage />
      </ReduxWrapper>
    </BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
