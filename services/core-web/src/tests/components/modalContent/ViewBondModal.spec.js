import React from "react";
import { shallow } from "enzyme";
import { ViewBondModal } from "@/components/modalContent/ViewBondModal";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<ViewBondModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
