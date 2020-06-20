import React from "react";
import { shallow } from "enzyme";
import { UndergroundExploration } from "@/components/noticeOfWork/applications/review/activities/UndergroundExploration";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.underground_exploration;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("UndergroundExploration", () => {
  it("renders properly", () => {
    const component = shallow(<UndergroundExploration {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
