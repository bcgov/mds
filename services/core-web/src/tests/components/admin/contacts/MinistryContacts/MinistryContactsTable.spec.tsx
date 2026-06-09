import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MinistryContactsTable } from "@/components/admin/contacts/MinistryContacts/MinistryContactsTable";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { minespaceReducerType } from "@mds/common/redux/slices/minespaceSlice";

const dispatchProps = {
  openEditModal: jest.fn(),
  handleDeleteContact: jest.fn(),
};

const contacts = [
  {
    contact_guid: "123",
    first_name: "John",
    last_name: "Doe",
    mine_region_code: "NE",
    is_major_mine: true,
    is_general_contact: true,
    emli_contact_type_code: "ROE",
    email: "test@test.com",
    phone_number: "123-456-7890",
    fax_number: "098-765-4321",
    mailing_address_line_1: "123 Street",
    mailing_address_line_2: "Apt 4",
  },
  {
    contact_guid: "456",
    first_name: "Jane",
    last_name: "Doe",
    mine_region_code: "SW",
    is_major_mine: false,
    is_general_contact: false,
    emli_contact_type_code: "MMO",
    email: "jane@test.com",
    phone_number: "111-222-3333",
  }
];

const props = {
  contacts: contacts,
  mineRegionHash: { NE: "North East", SW: "South West" },
  MinistryContactTypesHash: { ROE: "Regional Office", MMO: "Major Mine Office" },
  isLoaded: true,
  isOffice: false,
  hideDelete: false,
};

describe("MinistryContactsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper><MinistryContactsTable {...dispatchProps} {...props} /></ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("renders as office table", () => {
    const { container: component } = render(
      <ReduxWrapper><MinistryContactsTable {...dispatchProps} {...props} isOffice={true} /></ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });

});
