import React from "react";
import { shallow } from "enzyme";
import { EMLIContactModal } from "@/components/modalContent/EMLIContactModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.regionDropdownOptions = [];
  props.EMLIContactTypes = [];
  props.isEdit = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EMLIContactModal", () => {
  it("renders properly", () => {
    const component = shallow(<EMLIContactModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
