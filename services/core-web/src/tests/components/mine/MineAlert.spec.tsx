import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import MineAlert from "@/components/mine/MineAlert";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

describe("MineAlert", () => {
  it("renders dispatchProperly", async () => {
    const { container, findByTestId } = render(
      <ReduxWrapper>
        <MineAlert mine={MOCK.MINES.mines[MOCK.MINES.mineIds[0]]} />
      </ReduxWrapper>
    );

    await findByTestId("active-alert");

    expect(container).toMatchSnapshot();
  });
});
