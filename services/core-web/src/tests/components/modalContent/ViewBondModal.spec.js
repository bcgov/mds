import React from "react";
import { render } from "@testing-library/react";
import { ViewBondModal } from "@/components/modalContent/ViewBondModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.bondTypeOptionsHash = MOCK.BOND_TYPE_OPTIONS_HASH;
  props.bondStatusOptionsHash = MOCK.BOND_STATUS_OPTIONS_HASH;
  props.bondDocumentTypeOptionsHash = MOCK.BOND_DOCUMENT_TYPE_OPTIONS_HASH;
  [props.bond] = MOCK.BONDS.records;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ViewBondModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ViewBondModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
