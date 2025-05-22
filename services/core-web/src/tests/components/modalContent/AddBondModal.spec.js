import React from "react";
import { render } from "@testing-library/react";
import { AddBondModal } from "@/components/modalContent/AddBondModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "Add Bond";
  props.permitGuid = "462562457";
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  props.bondTypeOptions = [];
  [props.bond] = MOCK.BONDS.records;
  [props.formValues] = MOCK.BONDS.records;
  props.bondStatusOptionsHash = MOCK.BOND_STATUS_OPTIONS_HASH;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddBondModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddBondModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
