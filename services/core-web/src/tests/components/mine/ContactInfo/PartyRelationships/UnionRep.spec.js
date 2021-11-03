import React from "react";
import { shallow } from "enzyme";
import UnionRep from "@/components/mine/ContactInfo/PartyRelationships/UnionRep";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {};

const setupReducerProps = () => {
  reducerProps.partyRelationship = { union_rep_company: "company name" };
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("UnionRep", () => {
  it("renders properly", () => {
    const component = shallow(<UnionRep {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
