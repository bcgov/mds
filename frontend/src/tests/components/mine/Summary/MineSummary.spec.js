import React from "react";
import { shallow } from "enzyme";
import { MineSummary } from "@/components/mine/Summary/MineSummary";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.partyRelationshipTypes = jest.fn();
  dispatchProps.partyRelationships = jest.fn();
  dispatchProps.summaryPartyRelationships = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupProps();
});

describe("MineSummary", () => {
  it("renders properly", () => {
    const component = shallow(<MineSummary {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
