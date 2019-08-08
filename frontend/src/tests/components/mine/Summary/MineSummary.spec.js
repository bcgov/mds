import React from "react";
import { shallow } from "enzyme";
import { MineSummary } from "@/components/mine/Summary/MineSummary";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.match = { params: { id: "18145c75-49ad-0101-85f3-a43e45ae989a" } };
  props.mines = MOCK.MINES.mines;
  props.minePermits = MOCK.PERMITS;
  props.partyRelationshipTypes = [];
  props.partyRelationships = [];
  props.mineComplianceInfo = {};
  props.complianceInfoLoading = true;
};

beforeEach(() => {
  setupProps();
});

describe("MineSummary", () => {
  it("renders properly", () => {
    const component = shallow(<MineSummary {...props} />);
    expect(component).toMatchSnapshot();
  });
});
