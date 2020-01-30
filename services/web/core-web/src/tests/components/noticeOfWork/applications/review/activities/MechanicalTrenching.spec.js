import React from "react";
import { shallow } from "enzyme";
import { MechanicalTrenching } from "@/components/noticeOfWork/applications/review/activities/MechanicalTrenching";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.mechanical_trenching;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("MechanicalTrenching", () => {
  it("renders properly", () => {
    const component = shallow(<MechanicalTrenching {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
