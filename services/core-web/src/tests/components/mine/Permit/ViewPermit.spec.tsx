import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, PERMITS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common";
import { BrowserRouter } from "react-router-dom";
import ViewPermit from "@/components/mine/Permit/ViewPermit";

const initialState = {
  [PERMITS]: { permits: MOCK.PERMITS },
  [MINES]: { mines: MOCK.MINES.mines },
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin, USER_ROLES.role_edit_template_conditions],
  },
  [STATIC_CONTENT]: {
    ...MOCK.BULK_STATIC_CONTENT_RESPONSE,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: MOCK.MINES.mineIds[0],
      permitGuid: MOCK.PERMITS[0].permit_guid,
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("ViewPermit", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ViewPermit />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
