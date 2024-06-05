import React from "react";
import { Incidents } from "@/components/dashboard/mine/incidents/Incidents";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { INCIDENTS } from "@mds/common/constants/reducerTypes";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { SidebarProvider } from "@mds/common/components/common/SidebarWrapper";

const initialState = {
  [INCIDENTS]: {
    incidents: MOCK.INCIDENTS.records,
    incidentPageData: MOCK.INCIDENTS,
  },
};
const mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];

describe("MineIncidents", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <SidebarProvider value={{ mine } as any}>
          <Incidents />
        </SidebarProvider>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
