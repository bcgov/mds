import React from "react";
import { shallow } from "enzyme";
import { MineReclamationInvoiceTable } from "@/components/mine/Securities/MineReclamationInvoiceTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openEditReclamationInvoiceModal = jest.fn();
  dispatchProps.onExpand = jest.fn();
  dispatchProps.recordsByPermit = jest.fn();
  dispatchProps.getBalance = jest.fn();
  dispatchProps.getSum = jest.fn();
  dispatchProps.getAmountSum = jest.fn();
};

const setupProps = () => {
  props.permits = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers;
  props.isLoaded = true;
  props.expandedRowKeys = [];
  props.invoices = MOCK.RECLAMATION_INVOICES.records;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineReclamationInvoiceTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineReclamationInvoiceTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
