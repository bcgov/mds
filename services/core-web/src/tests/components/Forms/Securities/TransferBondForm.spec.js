import React from "react";
import { render } from "@testing-library/react";
import { TransferBondForm } from "@/components/Forms/Securities/TransferBondForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
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
    const { container: component } = render(<ReduxWrapper><TransferBondForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
