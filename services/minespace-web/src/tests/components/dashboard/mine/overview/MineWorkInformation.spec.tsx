import React from "react";
import { shallow } from "enzyme";
import { MineWorkInformation } from "@/components/dashboard/mine/overview/MineWorkInformation";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

describe("MineWorkInformation", () => {
  it("renders properly", () => {
    const wrapper = shallow(
      <MineWorkInformation
        mine_guid={MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_guid}
        mineWorkInformations={MOCK.MINE_WORK_INFORMATIONS}
        fetchMineWorkInformations={jest.fn(() => Promise.resolve())}
        createMineWorkInformation={jest.fn(() => Promise.resolve())}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
