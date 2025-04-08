import React from "react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import MineComplianceInfo from "@/components/mine/Compliance/MineComplianceInfo";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { COMPLIANCE, MINES } from "@mds/common/constants/reducerTypes";

function mockRouter() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      mineGuid: MOCK.MINES.mineIds[0],
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}
jest.mock("react-router-dom", () => mockRouter());

function mockCompliance() {
  const original = jest.requireActual("@mds/common/redux/actionCreators/complianceActionCreator");
  return {
    ...original,
    fetchMineComplianceInfo: jest.fn().mockReturnValue(() => Promise.resolve(MOCK.COMPLIANCE)),
  };
}
jest.mock("@mds/common/redux/actionCreators/complianceActionCreator", () => mockCompliance());

const initialState: any = {
  [MINES]: MOCK.MINES,
  [COMPLIANCE]: {
    mineComplianceInfo: MOCK.COMPLIANCE,
  },
};

describe("MineComplianceInfo", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={ initialState } >
        <BrowserRouter>
          <MineComplianceInfo />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
