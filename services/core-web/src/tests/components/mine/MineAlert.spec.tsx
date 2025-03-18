import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import MineAlert from "@/components/mine/MineAlert";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { MINE_ALERTS } from "@/constants/reducerTypes";

const initialState = {
  [MINE_ALERTS]: {
    mineAlerts: MOCK.MINE_ALERTS.records
  }
}

describe("MineAlert", () => {
  it("renders dispatchProperly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MineAlert mine={MOCK.MINES.mines[MOCK.MINES.mineIds[0]]} />
      </ReduxWrapper>
    )
    expect(container).toMatchSnapshot();
  });
});
