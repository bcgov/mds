import React from "react";
import { render } from "@testing-library/react";
import { MineHeader } from "@/components/mine/MineHeader";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES, AUTHENTICATION } from "@mds/common/constants/reducerTypes";

// Mock the MineHeaderMapLeaflet component
jest.mock("@/components/maps/MineHeaderMapLeaflet", () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-mine-header-map">Mock Map</div>,
  };
});

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

const initialState = {
  [MINES]: { ...MOCK.MINES, mineGuid: mine.mine_guid },
  [AUTHENTICATION]: { userAccessData: [], userInfo: {}, isAuthenticated: false },
};

describe("MineHeader", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MineHeader mine={mine} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});