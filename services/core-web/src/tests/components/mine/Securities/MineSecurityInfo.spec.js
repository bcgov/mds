import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { MineSecurityInfo } from "@/components/mine/Securities/MineSecurityInfo";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchPermits: jest.fn(() => Promise.resolve()),
  fetchMineBonds: jest.fn(() => Promise.resolve()),
  createBond: jest.fn(),
  updateBond: jest.fn(),
  fetchMineReclamationInvoices: jest.fn(() => Promise.resolve()),
  createReclamationInvoice: jest.fn(),
  updateReclamationInvoice: jest.fn(),
};
const props = {
  match: { params: { id: "18145c75-49ad-0101-85f3-a43e45ae989a" } },
  mineGuid: MOCK.MINES.mineIds[0],
  permits: MOCK.PERMITS,
  bondTotals: MOCK.BOND_TOTALS,
  bondStatusOptionsHash: MOCK.BOND_STATUS_OPTIONS_HASH,
  bondTypeOptionsHash: MOCK.BOND_TYPE_OPTIONS_HASH,
  bonds: MOCK.BONDS.records,
  invoices: MOCK.RECLAMATION_INVOICES.records,
};

describe("MineSecurityInfo", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MineSecurityInfo {...dispatchProps} {...props} /></ReduxWrapper>);
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
