import React from "react";
import { render } from "@testing-library/react";
import { ViewPartyRelationships } from "@/components/mine/ContactInfo/ViewPartyRelationships";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  handleChange: jest.fn(),
  createParty: jest.fn(),
  fetchParties: jest.fn(),
  fetchMineRecordById: jest.fn(),
  addPartyRelationship: jest.fn(),
  fetchPartyRelationships: jest.fn(() => Promise.resolve()),
  createTailingsStorageFacility: jest.fn(),
  updatePartyRelationship: jest.fn(),
  removePartyRelationship: jest.fn(),
};
const props = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
};

describe("ViewPartyRelationships", () => {
  it("renders properly", () => {
    const { container: component } = render(<ViewPartyRelationships {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
