import React from "react";
import { shallow } from "enzyme";
import { SandGravelQuarry } from "@/components/noticeOfWork/applications/review/activities/SandGravelQuarry";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.isViewMode = true;
  reducerProps.initialValues = NOW_MOCK.IMPORTED_NOTICE_OF_WORK.sand_and_gravel;
  reducerProps.editRecord = jest.fn();
  reducerProps.addRecord = jest.fn();
};

beforeEach(() => {
  setupReducerProps();
});

describe("SandGravelQuarry", () => {
  it("renders properly", () => {
    const component = shallow(<SandGravelQuarry {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
