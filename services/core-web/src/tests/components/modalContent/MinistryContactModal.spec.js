import React from "react";
import { render } from "@testing-library/react";
import { MinistryContactModal } from "@/components/modalContent/MinistryContactModal";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

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
  props.contacts = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinistryContactModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MinistryContactModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
