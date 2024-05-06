import React from "react";
import { Inspections } from "@/components/dashboard/mine/inspections/Inspections";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";
import { COMPLIANCE } from "@mds/common/constants/reducerTypes";

const initialState = {
  [COMPLIANCE]: {
    mineComplianceInfo: MOCK.COMPLIANCE,
  },
};

function mockFunction() {
  const original = jest.requireActual("@mds/common/redux/actionCreators/complianceActionCreator");
  return {
    ...original,
    // the actual function sets the value of [COMPLIANCE].mineComplianceInfo = {}
    // before making the network call. Override to get data in table
    fetchMineComplianceInfo: jest.fn().mockReturnValue(() => Promise.resolve(MOCK.COMPLIANCE)),
  };
}

jest.mock("@mds/common/redux/actionCreators/complianceActionCreator", () => mockFunction());

const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

describe("Inspections", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <SidebarProvider value={{ mine } as any}>
          <Inspections />
        </SidebarProvider>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
