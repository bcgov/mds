import React from "react";
import { shallow } from "enzyme";
import { TransferBondForm } from "@/components/Forms/Securities/TransferBondForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "Transfer Bond";
  props.permitGuid = "1628847c-060b-45f2-990f-815877174801";
  props.submitting = false;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  props.bondTypeOptions = [];
  [props.bond] = MOCK.BONDS.records;
  props.permits = MOCK.PERMITS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("TransferBondForm", () => {
  it("renders properly", () => {
    const component = shallow(<TransferBondForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
