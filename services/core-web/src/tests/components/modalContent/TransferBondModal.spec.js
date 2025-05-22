import React from "react";
import { render } from "@testing-library/react";
import { TransferBondModal } from "@/components/modalContent/TransferBondModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><TransferBondModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
