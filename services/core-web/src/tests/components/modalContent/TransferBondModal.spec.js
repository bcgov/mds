import React from "react";
import { shallow } from "enzyme";
import { TransferBondModal } from "@/components/modalContent/TransferBondModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "Transfer Bond";
  props.permitGuid = "1628847c-060b-45f2-990f-815877174801";
  props.mineGuid = "3512521";
  [props.bond] = MOCK.BONDS.records;
  props.permits = MOCK.PERMITS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("TransferBondModal", () => {
  it("renders properly", () => {
    const component = shallow(<TransferBondModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
