import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { PermitConditionManagement } from "@/components/mine/Permit/PermitConditionManagement";
import { MINES, PERMITS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mine_guid: "8e9ca839-a28e-427e-997e-9ef23d9d97cd",
      permit_guid: "1628847c-060b-45f2-990f-815877174801",
      id: "8729830e-5e9a-4be8-9eef-dac4af775f1d"
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());


const initialState = {
  [STATIC_CONTENT]: MOCK.BULK_STATIC_CONTENT_RESPONSE,
  [MINES]: { mines: MOCK.MINES },
  [PERMITS]: {
    editingConditionFlag: false,
    permitConditions: MOCK.PERMITS[0].permit_amendments[0].conditions,
    permitAmendments: {
      [MOCK.PERMITS[0].permit_amendments[0].permit_amendment_guid]: MOCK.PERMITS[0].permit_amendments[0]
    }
  }
};


describe("PermitConditionManagement", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <PermitConditionManagement />
        </ReduxWrapper>
      </BrowserRouter>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
