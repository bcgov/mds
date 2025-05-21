import React from "react";
import { render } from "@testing-library/react";
import { MineSpaceMinistryContactManagement } from "@/components/admin/contacts/MinistryContacts/MineSpaceMinistryContactManagement";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMinistryContacts = jest.fn(() => Promise.resolve());
  dispatchProps.updateMinistryContact = jest.fn();
  dispatchProps.deleteMinistryContact = jest.fn();
  dispatchProps.createMinistryContact = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.MinistryContacts = [];
  props.mineRegionHash = {};
  props.MinistryContactTypesHash = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineSpaceMinistryContactManagement", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><MineSpaceMinistryContactManagement {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
