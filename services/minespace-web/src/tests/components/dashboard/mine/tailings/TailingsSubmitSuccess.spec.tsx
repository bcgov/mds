import React from "react";
import { MINES, TAILINGS } from "@mds/common/constants/reducerTypes";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import TailingsSubmitSuccess from "@/components/pages/Tailings/TailingsSubmitSuccess";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const initialState = {
  [MINES]: MOCK.MINES,
  [TAILINGS]: { tsf: MOCK.TSF },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");

  const MOCK = require("@mds/common/tests/mocks/dataMocks");
  console.log(MOCK.MINES.mineIds[0]);
  console.log(MOCK.TSF.mine_tailings_storage_facility_guid);
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: MOCK.MINES.mineIds[0],
      tailingsStorageFacilityGuid: MOCK.TSF.mine_tailings_storage_facility_guid,
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("TailingsSubmitSuccess", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <TailingsSubmitSuccess />
        </ReduxWrapper>
      </BrowserRouter>
    );

    expect(container).toMatchSnapshot();
  });
});
