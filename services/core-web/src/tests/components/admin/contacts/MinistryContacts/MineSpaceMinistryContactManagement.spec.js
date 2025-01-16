import React from "react";
import { shallow } from "enzyme";
import { MineSpaceMinistryContactManagement } from "@/components/admin/contacts/MinistryContacts/MineSpaceMinistryContactManagement";

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
    const component = shallow(<MineSpaceMinistryContactManagement {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
