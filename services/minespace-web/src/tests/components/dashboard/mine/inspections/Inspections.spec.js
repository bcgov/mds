import React from "react";
import { shallow } from "enzyme";
import { Inspections } from "@/components/dashboard/mine/inspections/Inspections";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.mineComplianceInfo = MOCK.COMPLIANCE;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineComplianceInfo = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("Inspections", () => {
  it("renders properly", () => {
    const component = shallow(<Inspections {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
