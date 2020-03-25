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
  props.bondTypeOptionsHash = {};
  props.statusTypeOptionsHash = {};
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
