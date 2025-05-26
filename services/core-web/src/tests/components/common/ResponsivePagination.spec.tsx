import React from "react";
import { shallow } from "enzyme";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";

const props = {
  currentPage: 1,
  pageTotal: 1000,
  itemsPerPage: 25,
};
const dispatchProps = {
  onPageChange: jest.fn(),
};

describe("ResponsivePagination", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ResponsivePagination {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
