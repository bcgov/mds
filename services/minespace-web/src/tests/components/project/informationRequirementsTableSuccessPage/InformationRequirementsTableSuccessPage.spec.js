import React from "react";
import { render } from "@testing-library/react";
import { InformationRequirementsTableSuccessPage } from "@/components/pages/Project/InformationRequirementsTableSuccessPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.location = { state: { project: MOCK.PROJECT } };
};

beforeEach(() => {
  setupProps();
});

describe("InformationRequirementsTableSuccessPage", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <InformationRequirementsTableSuccessPage {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
