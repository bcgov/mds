import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { NavBar } from "@/components/navigation/NavBar";
import { AUTHENTICATION, MINES } from "@mds/common/constants/reducerTypes";

const initialState = {
  [AUTHENTICATION]: {
    userInfo: {},
    isAuthenticated: true,
  },
  [MINES]: {
    currentUserVerifiedMines: [],
    currentUserUnverifiedMinesMines: [],
  },
};

describe("NavBar", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <NavBar activeButton="" isMenuOpen={false} toggleHamburgerMenu={jest.fn()} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
