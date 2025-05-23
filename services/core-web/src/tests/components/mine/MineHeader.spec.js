import React from "react";
import { shallow } from "enzyme";
import { MineHeader } from "@/components/mine/MineHeader";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  updateMineRecord: jest.fn(),
  fetchMineRecordById: jest.fn(),
  removeMineType: jest.fn(),
  createTailingsStorageFacility: jest.fn(),
  closeModal: jest.fn(),
  openModal: jest.fn(),
};

const props = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  mineStatusOptions: MOCK.STATUS_OPTIONS.records,
  mineRegionOptions: MOCK.REGION_DROPDOWN_OPTIONS,
  mineRegionHash: MOCK.REGION_HASH,
  mineTenureTypes: MOCK.TENURE_TYPES_DROPDOWN_OPTIONS,
  mineTenureHash: MOCK.TENURE_HASH,
  transformedMineTypes: MOCK.MINE_TYPES[0],
};

describe("MineHeader", () => {
  it("renders dispatchProperly", () => {
    const component = shallow(<MineHeader {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
