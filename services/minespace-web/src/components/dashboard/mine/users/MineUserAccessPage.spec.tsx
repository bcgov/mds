import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import MineUserAccessPage from "./MineUserAccessPage";
import { minespaceReducerType } from "@mds/common/redux/slices/minespaceSlice";
import { MINESPACE_USERS } from "@mds/common/tests/mocks/dataMocks";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";

const mineGuid = "fc72863d-83e8-46ba-90f9-87b0ed78823f";

const initialState = {
  [minespaceReducerType]: {
    minespaceUsersByMine: {
      [mineGuid]: MINESPACE_USERS.filter((u) => u.mines.includes(mineGuid)),
    },
  },
};

describe("MineUserAccessPage - minespace", () => {
  it("renders properly", async () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <SidebarContext.Provider value={{ mine: { mine_guid: mineGuid } }}>
          <MineUserAccessPage />
        </SidebarContext.Provider>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
