import React from "react";
import { shallow } from "enzyme";
import { InformationRequirementsTableEntryTab } from "@/components/pages/Project/InformationRequirementsTableEntryTab";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<InformationRequirementsTableEntryTab {...props} />);
    expect(component).toMatchSnapshot();
  });
});
