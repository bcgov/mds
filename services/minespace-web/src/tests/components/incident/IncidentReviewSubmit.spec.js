import React from "react";
import { shallow } from "enzyme";
import { IncidentReviewSubmit } from "@/components/pages/Incidents/IncidentReviewSubmit";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.incident = MOCK.INCIDENT;
  props.location = {
    state: { current: 2, mine: MOCK.MINES.mines["18133c75-49ad-4101-85f3-a43e35ae989a"] },
  };
  props.applicationSubmitted = false;
};

beforeEach(() => {
  setupProps();
});

describe("IncidentReviewSubmit", () => {
  it("renders properly", () => {
    const component = shallow(<IncidentReviewSubmit {...props} />);
    expect(component).toMatchSnapshot();
  });
});
