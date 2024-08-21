import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES, STATIC_CONTENT, PERMITS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

import PermitConditions from "./PermitConditions";

const initialState = {
  [MINES]: MOCK.MINES,
  [PERMITS]: { permits: MOCK.PERMITS },
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      id: MOCK.MINES.mineIds[0],
      permitGuid: MOCK.PERMITS[0].permit_guid,
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

describe("PermitConditions", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <PermitConditions latestAmendment={MOCK.PERMITS[0].permit_amendments[1]} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
