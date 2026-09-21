import React from "react";
import { render } from "@testing-library/react";
import MinespaceUserAccessModal from "@/components/admin/MinespaceUserAccessModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { MINES } from "@mds/common/constants/reducerTypes";

const initialState = {
  [MINES]: {
    mineSearchResultsForNewUser: MOCK.MINE_NAME_LIST.mines,
  },
};

const props = {
  user: MOCK.MINESPACE_USER_REQUESTS[0],
  mines: MOCK.MINE_NAME_LIST.mines,
  handleUpdateUser: jest.fn(() => Promise.resolve()),
};

describe("MinespaceUserAccessModal", () => {
  it("renders properly with pending access request", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MinespaceUserAccessModal {...props} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders properly with rejected user", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MinespaceUserAccessModal {...props} user={MOCK.MINESPACE_USER_REQUESTS[1]} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
