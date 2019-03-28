import React from "react";
import { shallow } from "enzyme";
import { AddVarianceModal } from "@/components/modalContent/AddVarianceModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "48593";
  props.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddVarianceModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddVarianceModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
