import React from "react";
import { shallow } from "enzyme";
import { InformationRequirementsTableSuccessPage } from "@/components/pages/Project/InformationRequirementsTableSuccessPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.location = { state: { project: MOCK.PROJECT } };
};

beforeEach(() => {
  setupProps();
});

describe("InformationRequirementsTableSuccessPage", () => {
  it("renders properly", () => {
    const component = shallow(<InformationRequirementsTableSuccessPage {...props} />);
    expect(component).toMatchSnapshot();
  });
});
