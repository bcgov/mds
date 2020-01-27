import React from "react";
import { shallow } from "enzyme";
import { AccessRoads } from "@/components/noticeOfWork/applications/review/activities/AccessRoads";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.exploration_access;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("AccessRoads", () => {
  it("renders properly", () => {
    const component = shallow(<AccessRoads {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
