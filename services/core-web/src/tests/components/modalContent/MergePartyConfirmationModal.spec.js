import React from "react";
import { render } from "@testing-library/react";
import { MergePartyConfirmationModal } from "@/components/modalContent/MergePartyConfirmationModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.initialValues = {};
  props.provinceOptions = [];
  props.isPerson = false;
  props.partyRelationshipTypesHash = {};
  props.roles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MergePartyConfirmationModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MergePartyConfirmationModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
