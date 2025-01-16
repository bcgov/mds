import React from "react";
import { shallow } from "enzyme";
import { MinistryContactModal } from "@/components/modalContent/MinistryContactModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.regionDropdownOptions = [];
  props.MinistryContactTypes = [];
  props.isEdit = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinistryContactModal", () => {
  it("renders properly", () => {
    const component = shallow(<MinistryContactModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
