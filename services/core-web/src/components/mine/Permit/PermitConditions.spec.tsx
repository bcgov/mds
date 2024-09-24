import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES, STATIC_CONTENT, PERMITS, AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

import ViewPermit from "./ViewPermit";
import { BrowserRouter } from "react-router-dom";
import { USER_ROLES } from "@mds/common/constants/environment";

const initialState = {
  [MINES]: MOCK.MINES,
  [PERMITS]: { permits: MOCK.PERMITS },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin, USER_ROLES.role_edit_template_conditions],
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: MOCK.MINES.mineIds[0],
      permitGuid: MOCK.PERMITS[0].permit_guid,
      tab: "conditions",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

// note that this test is for PermitConditions and it's using the ViewPermit (parent) component:
// there were some bugs encountered during development from the interaction between the parent/child
// and so it renders PermitConditions due to tab='conditions' above but is being tested within the
// context that it exists in
describe("PermitConditions", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
