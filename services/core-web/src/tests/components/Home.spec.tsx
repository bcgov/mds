import React from "react";
import { Home } from "@/components/Home";
import { STATIC_CONTENT } from "@mds/common";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { userReducerType } from "@mds/common/redux/slices/userSlice";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {};

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn().mockReturnValue({
    pathname: "/home",
  }),
}));

const initialState = {
  [userReducerType]: { user: MOCK.USER },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
};

describe("Home", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <Home {...props} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
