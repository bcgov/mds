import React from "react";
import { shallow } from "enzyme";
import MajorProjectSearch from "@/components/dashboard/majorProjectHomePage/MajorProjectSearch";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSearch = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.statusCodes = MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_DROPDOWN;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Major Project Search Component", () => {
  it("renders properly", () => {
    const component = shallow(<MajorProjectSearch {...props} />);
    expect(component).toMatchSnapshot();
  });
});
