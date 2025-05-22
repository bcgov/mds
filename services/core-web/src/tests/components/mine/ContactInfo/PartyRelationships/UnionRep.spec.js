import React from "react";
import { render } from "@testing-library/react";
import UnionRep from "@/components/mine/ContactInfo/PartyRelationships/UnionRep";
import { MINES } from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => { };

const setupReducerProps = () => {
  reducerProps.partyRelationship = { union_rep_company: "company name", party: { party_guid: "party-guid" } };
  reducerProps.mine = MINES.mines[MINES.mineIds[0]]
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("UnionRep", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><UnionRep {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
