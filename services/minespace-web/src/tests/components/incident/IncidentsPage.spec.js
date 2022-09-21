import React from "react";
import { shallow } from "enzyme";
import { IncidentsPage } from "@/components/pages/Incidents/IncidentsPage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { mineGuid: "5c654fe9-bce5-4ee4-891c-806c46266d54" } };
  props.location = {
    state: { current: 0, mine: MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"] },
  };
};

const setupDispatchProps = () => {
  dispatchProps.clearMineIncident = jest.fn(() => Promise.resolve());
  dispatchProps.createMineIncident = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("IncidentsPage", () => {
  it("renders properly", () => {
    const component = shallow(<IncidentsPage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
