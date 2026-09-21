import React from "react";
import { render } from "@testing-library/react";
import MinespaceAccessRequest from "@/components/pages/MinespaceAccessRequest";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper as MSWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES } from "@mds/common/constants/reducerTypes";
import { minespaceReducerType } from "@mds/common/redux/slices/minespaceSlice";

const initialState = {
  [AUTHENTICATION]: {
    isAuthenticated: true,
    userAccessData: [],
    userInfo: {
      preferred_username: "test_user",
      email: "test@example.com",
      given_name: "Test",
      family_name: "User",
    },
  },
  [minespaceReducerType]: {
    minespaceUsers: [],
    minespaceUsersByMine: {},
    minespaceUserMines: [],
    MinistryContacts: [],
    MinistryContactsByRegion: [],
    currentUserAccessRequest: null,
  },
  [MINES]: {
    mineSearchResultsForNewUser: MOCK.MINE_NAME_LIST.mines,
  },
};

describe("MinespaceAccessRequest", () => {
  it("renders properly for new user", () => {
    const { container } = render(
      <MSWrapper initialState={initialState}>
        <MinespaceAccessRequest />
      </MSWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders properly with existing access request", () => {
    const stateWithRequest = {
      ...initialState,
      [minespaceReducerType]: {
        ...initialState[minespaceReducerType],
        currentUserAccessRequest: MOCK.MINESPACE_USER_REQUESTS[0],
      },
    };

    const { container } = render(
      <MSWrapper initialState={stateWithRequest}>
        <MinespaceAccessRequest />
      </MSWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
