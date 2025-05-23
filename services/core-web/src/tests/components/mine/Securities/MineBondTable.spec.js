import React from "react";
import { render } from "@testing-library/react";
import { MineBondTable } from "@/components/mine/Securities/MineBondTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  openEditBondModal: jest.fn(),
  openViewBondModal: jest.fn(),
  openAddBondModal: jest.fn(),
  releaseOrConfiscateBond: jest.fn(),
  onExpand: jest.fn(),
  recordsByPermit: jest.fn(),
  activeBondCount: jest.fn(),
  getSum: jest.fn(),
};
const props = {
  permits: MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers,
  bondStatusOptionsHash: MOCK.BOND_STATUS_OPTIONS_HASH,
  bondTypeOptionsHash: {},
  isLoaded: true,
  expandedRowKeys: [],
};

describe("MineBondTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<MineBondTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
