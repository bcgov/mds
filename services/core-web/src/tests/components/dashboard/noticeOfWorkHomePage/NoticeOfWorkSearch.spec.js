import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkSearch } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";

const props = {};

const setupProps = () => {
  props.handleSearch = jest.fn();
  props.initialValues = {};
};

beforeEach(() => {
  setupProps();
});

describe("NoticeOfWorkSearch", () => {
  it("renders properly", () => {
    const component = shallow(<NoticeOfWorkSearch {...props} />);
    expect(component).toMatchSnapshot();
  });
});
