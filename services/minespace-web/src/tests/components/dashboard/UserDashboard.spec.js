import React from "react";
import { render } from "@testing-library/react";
import { MinesPage } from "@/components/pages/MinesPage";
import { AUTHENTICATION, USER_MINE_INFO } from "@/constants/reducerTypes";
import { USER_ROLES } from "@mds/common";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { MINE_RESPONSE } from "@/tests/mocks/dataMocks";

const initialState = {
  [USER_MINE_INFO]: {
    userMineInfo: {
      records: MINE_RESPONSE.mines,
      current_page: 1,
      items_per_page: 10,
      total: MINE_RESPONSE.mines.length,
      total_pages: 1,
    },
    mineDocuments: [],
    mine: null,
  },
  [AUTHENTICATION]: {
    isAuthenticated: true,
    userAccessData: [USER_ROLES.role_minespace_proponent],
    userInfo: {
      preferred_username: "test@bceid",
    },
    redirect: false,
    isProponent: true,
  },
};

describe("UserDashboard", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MinesPage />
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
