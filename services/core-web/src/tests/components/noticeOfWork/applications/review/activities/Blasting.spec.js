import React from "react";
import { shallow } from "enzyme";
import { Blasting } from "@/components/noticeOfWork/applications/review/activities/Blasting";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.blasting_operation;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("Blasting", () => {
  it("renders properly", () => {
    const component = shallow(<Blasting {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
