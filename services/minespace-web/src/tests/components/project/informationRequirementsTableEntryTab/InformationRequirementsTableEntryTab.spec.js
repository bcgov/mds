import React from "react";
import { render } from "@testing-library/react";
import { InformationRequirementsTableEntryTab } from "@/components/pages/Project/InformationRequirementsTableEntryTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.irt = MOCK.INFORMATION_REQUIREMENTS_TABLE;
  props.match = { params: { projectGuid: "1234-5678-x" } };
  props.history = { push: jest.fn() };
  props.mrcReviewRequired = false;
};

beforeEach(() => {
  setupProps();
});

describe("InformationRequirementsTableEntryTab", () => {
  it("renders properly", () => {
    const { container: component } = render(<InformationRequirementsTableEntryTab {...props} />);
    expect(component).toMatchSnapshot();
  });
});
