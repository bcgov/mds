import React from "react";
import { render } from "@testing-library/react";
import { MinistryContactsTable } from "@/components/admin/contacts/MinistryContacts/MinistryContactsTable";

const dispatchProps = {
  openEditModal: jest.fn(),
  handleDeleteContact: jest.fn(),
};
const props = {
  contacts: [],
  mineRegionHash: {},
  MinistryContactTypesHash: {},
  isLoaded: true,
  isOffice: false,
};

describe("MinistryContactsTable", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <MinistryContactsTable {...dispatchProps} {...props} />
    );
    expect(component).toMatchSnapshot();
  });
});
