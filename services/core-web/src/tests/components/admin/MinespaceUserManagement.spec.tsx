import React from "react";
import { render } from "@testing-library/react";
import MinespaceUserManagement from "@/components/admin/MinespaceUserManagement";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES } from "@mds/common/constants/reducerTypes";
import { minespaceReducerType } from "@mds/common/redux/slices/minespaceSlice";
import { USER_ROLES } from "@mds/common/constants/environment";

const initialState = {
  [AUTHENTICATION]: {
    isAuthenticated: true,
    userAccessData: [USER_ROLES.role_admin],
    userInfo: {
      preferred_username: "test_admin",
    },
  },
  [minespaceReducerType]: {
    minespaceUsers: [...MOCK.MINESPACE_USERS, ...MOCK.MINESPACE_USER_REQUESTS],
    minespaceUserMines: Object.values(MOCK.MINES.mines),
  },
  [MINES]: {
    mineNameList: MOCK.MINE_NAME_LIST.mines,
  },
};

describe("MinespaceUserManagement", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper initialState={initialState}>
        <MinespaceUserManagement />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
