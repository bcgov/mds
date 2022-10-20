import React from "react";
import { shallow } from "enzyme";
import { IncidentSuccessPage } from "@/components/pages/Incidents/IncidentSuccessPage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.location = { state: { project: MOCK.INCIDENT } };
};

beforeEach(() => {
  setupProps();
});

describe("IncidentSuccessPage", () => {
  it("renders properly", () => {
    const component = shallow(<IncidentSuccessPage {...props} />);
    expect(component).toMatchSnapshot();
  });
});
