import React from "react";
import { shallow } from "enzyme";
import { MineSecurityInfo } from "@/components/mine/Securities/MineSecurityInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchPermits = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineBonds = jest.fn(() => Promise.resolve());
  dispatchProps.createBond = jest.fn();
  dispatchProps.updateBond = jest.fn();
  dispatchProps.fetchMineReclamationInvoices = jest.fn(() => Promise.resolve());
  dispatchProps.createReclamationInvoice = jest.fn();
  dispatchProps.updateReclamationInvoice = jest.fn();
};

const setupProps = () => {
  props.match = { params: { id: "18145c75-49ad-0101-85f3-a43e45ae989a" } };
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.permits = MOCK.PERMITS;
  props.bondTotals = MOCK.BOND_TOTALS;
  props.bondStatusOptionsHash = MOCK.BOND_STATUS_OPTIONS_HASH;
  props.bondTypeOptionsHash = MOCK.BOND_TYPE_OPTIONS_HASH;
  props.bonds = MOCK.BONDS.records;
  props.invoices = MOCK.RECLAMATION_INVOICES.records;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineSecurityInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineSecurityInfo {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });

  it("getAmountSum is called for invoice amounts", () => {
    const component = shallow(<MineSecurityInfo {...dispatchProps} {...props} />);
    const instance = component.instance();
    const getAmountSumSpy = jest.spyOn(instance, "getAmountSum");
    instance.getAmountSum(props.permits[0]);
    expect(getAmountSumSpy).toHaveBeenCalledWith(props.permits[0]);
    expect(instance.getAmountSum(props.permits[0])).toEqual(1451);
  });
});
