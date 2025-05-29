import React from "react";
import { shallow } from "enzyme";
import { MineCard } from "@/components/mine/NoticeOfWork/MineCard";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  additionalPin: [],
  mineRegionHash: MOCK.REGION_HASH,
};
const dispatchProps = {};

describe("MineCard", () => {
  it("renders properly", () => {
    const component = shallow(<MineCard {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
