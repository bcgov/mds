import React from "react";
import { shallow } from "enzyme";
import { MineSpaceEMLIContactManagement } from "@/components/admin/contacts/EMLIContacts/MineSpaceEMLIContactManagement";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchEMLIContacts = jest.fn(() => Promise.resolve());
  dispatchProps.updateEMLIContact = jest.fn();
  dispatchProps.deleteEMLIContact = jest.fn();
  dispatchProps.createEMLIContact = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.EMLIContacts = [];
  props.mineRegionHash = {};
  props.EMLIContactTypesHash = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineSpaceEMLIContactManagement", () => {
  it("renders properly", () => {
    const component = shallow(<MineSpaceEMLIContactManagement {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
