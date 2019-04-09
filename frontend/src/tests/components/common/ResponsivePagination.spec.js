import React from "react";
import { shallow } from "enzyme";
import ResponsivePagination from "@/components/common/ResponsivePagination";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps = {
    onPageChange: jest.fn(),
  };
};

const setupProps = () => {
  props = {
    currentPage: 1,
    pageTotal: 1000,
    itemsPerPage: 25,
  };
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ResponsivePagination", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ResponsivePagination {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
