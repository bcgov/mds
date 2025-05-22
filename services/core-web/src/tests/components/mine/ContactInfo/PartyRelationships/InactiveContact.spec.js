import React from "react";
import { render } from "@testing-library/react";
import InactiveContact from "@/components/mine/ContactInfo/PartyRelationships/InactiveContact";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => { };

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.partyRelationshipTypeCode = "EOR";
  reducerProps.partyRelationshipTitle = "Engineer of Record";
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("InactiveContact", () => {
  it("renders properly", () => {
    const { container: component } = render(<InactiveContact {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
