import React from "react";
import { shallow } from "enzyme";
import { AddBondModal } from "@/components/modalContent/AddBondModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.isPerson = true;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddBondModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddBondModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
