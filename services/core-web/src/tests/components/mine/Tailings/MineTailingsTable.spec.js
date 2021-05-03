import React from "react";
import { shallow } from "enzyme";
import { MineTailingsTable } from "@/components/mine/Tailings/MineTailingsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.partyRelationships = MOCK.PARTYRELATIONSHIPS;
  props.TSFOperatingStatusCodeHash = {};
  props.consequenceClassificationStatusCodeHash = {};
  props.tailings = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_tailings_storage_facilities;
  props.isLoaded = true;
};

beforeEach(() => {
  setupProps();
});

describe("MineTailingsTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineTailingsTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
