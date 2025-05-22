import React from "react";
import { render } from "@testing-library/react";
import { IncidentSuccessPage } from "@/components/pages/Incidents/IncidentSuccessPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.location = { state: { project: MOCK.INCIDENT } };
};

beforeEach(() => {
  setupProps();
});

describe("IncidentSuccessPage", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <IncidentSuccessPage {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
