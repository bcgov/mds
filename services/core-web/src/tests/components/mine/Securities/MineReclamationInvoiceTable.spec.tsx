import React from "react";
import { render } from "@testing-library/react";
import { MineReclamationInvoiceTable } from "@/components/mine/Securities/MineReclamationInvoiceTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  openEditReclamationInvoiceModal: jest.fn(),
  onExpand: jest.fn(),
  recordsByPermit: jest.fn(),
  getBalance: jest.fn(),
  getSum: jest.fn(),
  getAmountSum: jest.fn(),
};
const props = {
  permits: MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers,
  isLoaded: true,
  expandedRowKeys: [],
  invoices: MOCK.RECLAMATION_INVOICES.records,
};

describe("MineReclamationInvoiceTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<MineReclamationInvoiceTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
