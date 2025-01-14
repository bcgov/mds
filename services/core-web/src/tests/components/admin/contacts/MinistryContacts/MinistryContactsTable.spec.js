import React from "react";
import { shallow } from "enzyme";
import { MinistryContactsTable } from "@/components/admin/contacts/MinistryContacts/MinistryContactsTable";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openEditModal = jest.fn();
  dispatchProps.handleDeleteContact = jest.fn();
};

const setupProps = () => {
  props.contacts = [];
  props.mineRegionHash = {};
  props.MinistryContactTypesHash = {};
  props.isLoaded = true;
  props.isOffice = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinistryContactsTable", () => {
  it("renders properly", () => {
    const component = shallow(<MinistryContactsTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
