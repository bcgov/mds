import React from "react";
import { render } from "@testing-library/react";
import { MineSpaceMinistryContactManagement } from "@/components/admin/contacts/MinistryContacts/MineSpaceMinistryContactManagement";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  fetchMinistryContacts: jest.fn(() => Promise.resolve()),
  updateMinistryContact: jest.fn(),
  deleteMinistryContact: jest.fn(),
  createMinistryContact: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  MinistryContacts: [],
  mineRegionHash: {},
  MinistryContactTypesHash: {},
};

describe("MineSpaceMinistryContactManagement", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <MineSpaceMinistryContactManagement {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
