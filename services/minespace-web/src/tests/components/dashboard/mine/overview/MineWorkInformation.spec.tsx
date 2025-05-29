import React from "react";
import { render } from "@testing-library/react";
import { MineWorkInformation } from "@/components/dashboard/mine/overview/MineWorkInformation";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

describe("MineWorkInformation", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <MineWorkInformation
          mine_guid={MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_guid}
          mineWorkInformations={MOCK.MINE_WORK_INFORMATIONS}
          fetchMineWorkInformations={jest.fn(() => Promise.resolve())}
          createMineWorkInformation={jest.fn(() => Promise.resolve())}
        />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
