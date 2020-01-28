import React from "react";
import { shallow } from "enzyme";
import { ReviewActivities } from "@/components/noticeOfWork/applications/review/ReviewActivities";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.noticeOfWork = NOW_MOCK.IMPORTED_NOTICE_OF_WORK;
  reducerProps.noticeOfWorkType = "COL";
};

beforeEach(() => {
  setupReducerProps();
});

describe("ReviewActivities", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewActivities {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
