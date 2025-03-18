import React from "react";
import { render } from "@testing-library/react";
import { MinePermitInfo } from "@/components/mine/Permit/MinePermitInfo";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { AUTHENTICATION, MINES, PERMITS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [PERMITS]: { permits: MOCK.PERMITS },
  [MINES]: { ...MOCK.MINES, mineGuid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd" },
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_admin],
  },
  [STATIC_CONTENT]: {
    permitAmendmentTypeCodeOptions:
      MOCK.BULK_STATIC_CONTENT_RESPONSE.permitAmendmentTypeCodeOptions,
    permitStatusCodes: MOCK.BULK_STATIC_CONTENT_RESPONSE.permitStatusCodes,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("MinePermitInfo", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <MinePermitInfo />
        </BrowserRouter>
      </ReduxWrapper>
    );
    const permitsTable = container.querySelector(".permits-table");
    expect(permitsTable).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
