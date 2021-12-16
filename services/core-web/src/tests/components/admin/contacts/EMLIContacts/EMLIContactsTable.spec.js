import React from "react";
import { shallow } from "enzyme";
import { EMLIContactsTable } from "@/components/admin/contacts/EMLIContacts/EMLIContactsTable";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openEditModal = jest.fn();
  dispatchProps.handleDeleteContact = jest.fn();
};

const setupProps = () => {
  props.contacts = [];
  props.mineRegionHash = {};
  props.EMLIContactTypesHash = {};
  props.isLoaded = true;
  props.isOffice = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EMLIContactsTable", () => {
  it("renders properly", () => {
    const component = shallow(<EMLIContactsTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
